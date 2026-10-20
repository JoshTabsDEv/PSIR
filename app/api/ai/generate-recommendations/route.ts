import { NextRequest, NextResponse } from "next/server";

type Tone = "objective" | "empathetic" | "firm";

// Single model, no fallback chain. Override with OPENAI_MODEL if OpenAI renames it.
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

function safeStr(v: unknown, fallback = "N/A") {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key is not configured. Add OPENAI_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const { identifyingData, criminalHistory, socioEconomicBackground, tone, manualPrompt } = body as {
      identifyingData?: Record<string, unknown>;
      criminalHistory?: {
        presentOffense?: Record<string, unknown>;
        priorRecords?: { nbi?: Record<string, unknown> };
        custodialStatus?: unknown;
      };
      socioEconomicBackground?: Record<string, unknown>;
      tone?: Tone;
      manualPrompt?: string;
    };

    const toneGuidance: Record<Tone, string> = {
      objective: "Write in a professional, neutral, and fact-based tone without emotional language.",
      empathetic:
        "Write with understanding and compassion while maintaining professionalism, acknowledging the subject's circumstances.",
      firm: "Write in a direct, authoritative tone that emphasizes accountability and consequences while remaining professional.",
    };

    const chosenTone: Tone = tone === "empathetic" || tone === "firm" ? tone : "objective";

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
      criminalHistory?.presentOffense?.convictedOf ?? criminalHistory?.presentOffense?.chargedWith
    )}
- Sentence: ${safeStr(criminalHistory?.presentOffense?.sentence)}
- Prior Criminal Record: ${safeStr(criminalHistory?.priorRecords?.nbi?.decisionStatus, "No record on file")}
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

    const customPrompt = typeof manualPrompt === "string" ? manualPrompt.trim().slice(0, 2000) : "";
    const prompt = customPrompt ? `${basePrompt}\n\nAdditional user instruction:\n${customPrompt}` : basePrompt;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        // gpt-5 family: max_completion_tokens (not max_tokens); temperature is fixed
        max_completion_tokens: 1200,
        reasoning_effort: "low",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI error: ${response.status} - ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const recommendations: string = data.choices?.[0]?.message?.content?.trim() || "";
    if (!recommendations) {
      throw new Error("No response content from OpenAI");
    }

    return NextResponse.json({
      success: true,
      data: { recommendations },
      meta: {
        tone: chosenTone,
        modelUsed: OPENAI_MODEL,
        provider: "openai",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error generating recommendations:", message);

    return NextResponse.json(
      {
        success: false,
        error: message || "Failed to generate recommendations. Check your OpenAI API key and try again.",
      },
      { status: 500 }
    );
  }
}
