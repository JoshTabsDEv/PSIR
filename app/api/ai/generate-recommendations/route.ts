import { NextRequest, NextResponse } from "next/server";

type Tone = "objective" | "empathetic" | "firm";

function safeStr(v: unknown, fallback = "N/A") {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}



export async function POST(request: NextRequest) {
  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OpenRouter API key is not configured. Add OPENROUTER_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const {
      identifyingData,
      criminalHistory,
      socioEconomicBackground,
      tone,
      manualPrompt,
    } =
      body as {
        identifyingData?: any;
        criminalHistory?: any;
        socioEconomicBackground?: any;
        tone?: Tone;
        manualPrompt?: string;
      };

    const toneGuidance: Record<Tone, string> = {
      objective:
        "Write in a professional, neutral, and fact-based tone without emotional language.",
      empathetic:
        "Write with understanding and compassion while maintaining professionalism, acknowledging the subject's circumstances.",
      firm: "Write in a direct, authoritative tone that emphasizes accountability and consequences while remaining professional.",
    };

    const chosenTone: Tone =
      tone === "empathetic" || tone === "firm" ? tone : "objective";

    const PRIMARY_MODEL = "deepseek/deepseek-chat-v3.1:free";
    const FALLBACK_MODEL = "deepseek/deepseek-r1:free";
    const FREE_ROUTER_MODEL = "openrouter/auto";

    const basePrompt = `
You are a professional probation officer writing recommendations for a Post-Sentence Investigation Report (PSIR) in the Philippine correctional system.

${toneGuidance[chosenTone]}

Based on the comprehensive assessment below, provide professional recommendations (3-4 sentences) for:
1. Nature of the case and offense
2. Community and Social background
3. Attitude Towards the offense
4. Behavior patterns and risks factor
5. Personal and Family Situation
6. Rehablitative potential
7. Overall Assessment

Add a Conclusion:

 In view of the totality of circumstances, the applicant is considered not suitable/suitable for probation, subject to strict compliance with all conditions imposed by the Court.

Subject Information:
- Education: ${safeStr(identifyingData?.educationalAttainment)}
- Occupation: ${safeStr(identifyingData?.occupation)}

Criminal History:
- Present Offense: ${safeStr(
      criminalHistory?.presentOffense?.convictedOf ??
        criminalHistory?.presentOffense?.chargedWith
    )}
- Sentence: ${safeStr(criminalHistory?.presentOffense?.sentence)}
- Prior Criminal Record: ${safeStr(
      criminalHistory?.priorRecords?.nbi?.decisionStatus,
      "No record on file"
    )}
- Custodial Status: ${safeStr(criminalHistory?.custodialStatus)}

Socio-Economic Factors:
- Family Economic Status: ${safeStr(socioEconomicBackground?.familyEconomicStatus)}
- Family Support: ${safeStr(socioEconomicBackground?.familySupport)}
- Community Ties: ${safeStr(socioEconomicBackground?.communityAcceptability)}
- Overall Well-Being: ${safeStr(socioEconomicBackground?.overallWellBeing)}

Write clear, analysis and evaluation that align with:
- Bureau of Corrections rehabilitation philosophy
- Philippine sentencing guidelines
- Available correctional programs
- Risk assessment and community safety

dont include any disclaimers about being an AI model or needing more information. Provide the best possible recommendations based on the given information.

Format: Professional paragraph without bullets or numbering.
`.trim();

    const customPrompt =
      typeof manualPrompt === "string" ? manualPrompt.trim().slice(0, 2000) : "";
    const prompt = customPrompt
      ? `${basePrompt}\n\nAdditional user instruction:\n${customPrompt}`
      : basePrompt;

    async function generateWithOpenRouter(modelName: string) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 538,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter error: ${response.status} - ${errorData.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("No response content from OpenRouter");
      }

      return data.choices[0].message.content.trim();
    }

    let recommendations = "";
    let modelUsed = "";

    // Try primary model
    try {
      recommendations = await generateWithOpenRouter(PRIMARY_MODEL);
      modelUsed = PRIMARY_MODEL;
    } catch (err: any) {
      console.error("Primary model failed:", err?.message || err);

      // Try fallback model
      try {
        recommendations = await generateWithOpenRouter(FALLBACK_MODEL);
        modelUsed = FALLBACK_MODEL;
      } catch (fallbackErr: any) {
        console.error("Fallback model failed:", fallbackErr?.message || fallbackErr);

        // Try free router as last resort
        try {
          recommendations = await generateWithOpenRouter(FREE_ROUTER_MODEL);
          modelUsed = FREE_ROUTER_MODEL;
        } catch (routerErr: any) {
          console.error("Free router also failed:", routerErr?.message || routerErr);
          throw routerErr;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { recommendations },
      meta: {
        tone: chosenTone,
        modelUsed,
        provider: "openrouter",
      },
    });
  } catch (error: any) {
    console.error("Error generating recommendations:", error?.message || error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to generate recommendations. Check your OpenRouter API key and try again.",
      },
      { status: 500 }
    );
  }
}