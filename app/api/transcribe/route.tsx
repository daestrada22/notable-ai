import { NextResponse } from "next/server";
import { findProperNouns, transcribe, ProperNounsResponse, UserCorrection } from "./utils";

export async function POST(request: Request) {
    const formData = await request.formData();
    const audioFile = formData.get("audioFile") as File;
    const correctionsJson = formData.get("corrections") as string | null;

    // Parse user corrections from localStorage (passed from client)
    let userCorrections: UserCorrection[] = [];
    if (correctionsJson) {
        try {
            userCorrections = JSON.parse(correctionsJson);
        } catch {
            // Ignore parse errors, proceed without corrections
        }
    }

    // Step 1: STT - Transcribe the file
    const transcription = await transcribe(audioFile);

    // Step 2: LLM - Proper noun recognition (validated with Zod)
    const properNouns: ProperNounsResponse = await findProperNouns(transcription, userCorrections);

    // Step 3: Return the transcription and validated proper nouns
    return NextResponse.json({ transcription, properNouns });
}