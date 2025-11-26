import { ProperNoun } from "@/app/api/transcribe/utils";

export interface Note {
    id: string;
    text: string;
    createdAt: number;
}

const NOTES_KEY = "notable-notes";

export function getNotes(): Note[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(NOTES_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function saveNote(text: string): Note {
    const notes = getNotes();
    const note: Note = {
        id: crypto.randomUUID(),
        text,
        createdAt: Date.now(),
    };
    notes.unshift(note);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return note;
}

export function deleteNote(id: string): boolean {
    const notes = getNotes();
    const filtered = notes.filter((note) => note.id !== id);
    if (filtered.length === notes.length) return false;

    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
    return true;
}
