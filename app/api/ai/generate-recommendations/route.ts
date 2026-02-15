import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Tone = "objective" | "empathetic" | "firm";

function safeStr(v: unknown, fallback = "N/A") {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

async function listModels(apiKey: string) {
  // Optional debug helper recommended by the API error message (ListModels).
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    { method: "GET" }
  );
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini API key is not configured. Add GEMINI_API_KEY to your .env.local file.",
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


    const PRIMARY_MODEL = "gemini-2.5-pro";
    const FALLBACK_MODEL = "gemini-2.5-flash";

    const genAI = new GoogleGenerativeAI(apiKey);

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


    async function generateWith(modelName: string) {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    }

    let recommendations = "";
    try {
      recommendations = await generateWith(PRIMARY_MODEL);
    } catch (err: any) {
      // If the primary model fails (quota/model availability), try fallback.
      console.error("Primary model failed:", err?.message || err);
      recommendations = await generateWith(FALLBACK_MODEL);
    }

    return NextResponse.json({
      success: true,
      data: { recommendations },
      meta: {
        tone: chosenTone,
        modelUsed: recommendations ? PRIMARY_MODEL : FALLBACK_MODEL,
      },
    });
  } catch (error: any) {
    console.error("Error generating recommendations:", error?.message || error);

    // Helpful: if it smells like "model not found", show available models.
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && String(error?.message || "").includes("models/")) {
      const models = await listModels(apiKey);
      return NextResponse.json(
        {
          success: false,
          error:
            error?.message ||
            "Failed to generate recommendations. Check your API key, model name, and quotas.",
          debug: {
            listModelsStatus: models.status,
            listModelsOk: models.ok,
            // This can be large; keep it if you’re debugging locally.
            models: models.data,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to generate recommendations. Please check your API key and try again.",
      },
      { status: 500 }
    );
  }
}
