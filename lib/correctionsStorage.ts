export interface Correction {
    id: string;
    original: string;
    corrected: string;
    createdAt: number;
}

const CORRECTIONS_KEY = "notable-corrections";

export function getCorrections(): Correction[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(CORRECTIONS_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function saveCorrection(original: string, corrected: string): Correction {
    const corrections = getCorrections();

    // Check if this correction already exists
    const existing = corrections.find(
        (c) => c.original.toLowerCase() === original.toLowerCase()
    );

    if (existing) {
        // Update the existing correction
        existing.corrected = corrected;
        existing.createdAt = Date.now();
        localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(corrections));
        return existing;
    }

    // Create new correction
    const correction: Correction = {
        id: crypto.randomUUID(),
        original,
        corrected,
        createdAt: Date.now(),
    };
    corrections.unshift(correction);
    localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(corrections));
    return correction;
}

export function deleteCorrection(id: string): boolean {
    const corrections = getCorrections();
    const filtered = corrections.filter((c) => c.id !== id);
    if (filtered.length === corrections.length) return false;

    localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(filtered));
    return true;
}
