import { z } from "zod";
import { SYSTEM_PROMPT } from "./constants";

export const ProperNounSchema = z.object({
    original: z.string(),
    corrections: z.array(z.string()),
    confidence: z.enum(["high", "medium", "low"]),
    type: z.enum(["person", "place", "company", "brand", "other"]),
});

export const ProperNounsResponseSchema = z.object({
    properNouns: z.array(ProperNounSchema),
});

export type ProperNoun = z.infer<typeof ProperNounSchema>;
export type ProperNounsResponse = z.infer<typeof ProperNounsResponseSchema>;

export interface UserCorrection {
    original: string;
    corrected: string;
}

export async function transcribe(audioFile: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "whisper-large-v3");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Groq transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
}

export async function findProperNouns(transcription: string, userCorrections: UserCorrection[] = []): Promise<ProperNounsResponse> {
    if (!transcription || transcription.trim().length === 0) {
        return { properNouns: [] };
    }

    // Build system prompt with user corrections if available
    let systemPrompt = SYSTEM_PROMPT;
    if (userCorrections.length > 0) {
        const correctionsText = userCorrections
            .map((c) => `- "${c.original}" should be "${c.corrected}"`)
            .join("\n");
        systemPrompt += `\n\nIMPORTANT: The user has previously corrected the following proper nouns. Use these corrections as the preferred spelling:\n${correctionsText}`;
    }

    console.log(systemPrompt);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: `Analyze the following transcription for proper nouns:\n\n${transcription}`,
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API call failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Extract JSON from response - Claude may include extra text around the JSON to sound conversational
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error(`Failed to extract JSON from response: ${text.substring(0, 100)}...`);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return ProperNounsResponseSchema.parse(parsed);
}