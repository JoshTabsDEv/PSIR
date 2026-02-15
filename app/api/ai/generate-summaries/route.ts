import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function safeStr(v: unknown, fallback = "N/A") {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await request.json();
    const { identifyingData, criminalHistory, socioEconomicBackground } = body;

    // ✅ FIX: use a current model ID (NOT gemini-pro)
    // Pick one:
    // - gemini-2.5-pro (higher quality)
    // - gemini-2.5-flash (faster/cheaper)
    const PRIMARY_MODEL = "gemini-2.5-flash";
    const FALLBACK_MODEL = "gemini-2.5-pro";

    async function generate(modelName: string, prompt: string) {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    }

    console.log("Generating summaries with Gemini...");

    // Generate Criminal History Summary
    const criminalHistoryPrompt = `
You are a professional probation officer writing a Post-Sentence Investigation Report (PSIR).

Based on the following criminal history data, provide a concise professional summary (2-3 sentences):

Present Offense:
- Charged with: ${safeStr(criminalHistory?.presentOffense?.chargedWith)}
- Convicted of: ${safeStr(criminalHistory?.presentOffense?.convictedOf)}
- Sentence: ${safeStr(criminalHistory?.presentOffense?.sentence)}
- Custodial Status: ${safeStr(criminalHistory?.custodialStatus)}

Prior Records:
- NBI: ${safeStr(criminalHistory?.priorRecords?.nbi?.decisionStatus, "No record on file")}
- CMRD: ${safeStr(criminalHistory?.priorRecords?.cmrd?.decisionStatus, "No derogatory record")}
- Others: ${safeStr(criminalHistory?.priorRecords?.others?.decisionStatus, "None")}

Write a professional, objective summary highlighting key points.
`.trim();

    let criminalHistorySummary: string;
    try {
      criminalHistorySummary = await generate(PRIMARY_MODEL, criminalHistoryPrompt);
    } catch (e) {
      // fallback if model temporarily fails / model not allowed
      criminalHistorySummary = await generate(FALLBACK_MODEL, criminalHistoryPrompt);
    }

    // Generate Socio-Economic Summary
    const socioEconomicPrompt = `
You are a professional probation officer writing a Post-Sentence Investigation Report (PSIR).

Based on the following socio-economic data, provide a concise professional summary (2-3 sentences):

Socio-Economic Background:
- Family Economic Status: ${safeStr(socioEconomicBackground?.familyEconomicStatus)}
- Family Relationship: ${safeStr(socioEconomicBackground?.familyRelationship)}
- Family Reputation: ${safeStr(socioEconomicBackground?.familyReputation)}
- Family Support: ${safeStr(socioEconomicBackground?.familySupport)}
- Community Acceptability: ${safeStr(socioEconomicBackground?.communityAcceptability)}
- Overall Well-Being: ${safeStr(socioEconomicBackground?.overallWellBeing)}

Personal Information:
- Name: ${safeStr(identifyingData?.firstName, "")} ${safeStr(identifyingData?.lastName, "")}
- Age: ${safeStr(identifyingData?.age)}
- Occupation: ${safeStr(identifyingData?.occupation)}
- Education: ${safeStr(identifyingData?.educationalAttainment)}

Write a professional, empathetic summary highlighting key social factors and support systems.
`.trim();

    let socioEconomicSummary: string;
    try {
      socioEconomicSummary = await generate(PRIMARY_MODEL, socioEconomicPrompt);
    } catch (e) {
      socioEconomicSummary = await generate(FALLBACK_MODEL, socioEconomicPrompt);
    }

    return NextResponse.json({
      success: true,
      data: {
        criminalHistory: criminalHistorySummary,
        socioEconomicBackground: socioEconomicSummary,
      },
      meta: { modelPrimary: PRIMARY_MODEL, modelFallback: FALLBACK_MODEL },
    });
  } catch (error: any) {
    const msg = String(error?.message || error);
    console.error("Error generating summaries:", msg);

    const looksLikeModelError =
      msg.includes("models/") && (msg.includes("not found") || msg.includes("not supported"));

    return NextResponse.json(
      {
        success: false,
        error: looksLikeModelError
          ? "Model name is invalid/unsupported. Use a current Gemini model id like gemini-2.5-flash or gemini-2.5-pro."
          : msg || "Failed to generate summaries. Please check your API key and try again.",
      },
      { status: 500 }
    );
  }
}
