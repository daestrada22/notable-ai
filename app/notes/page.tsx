"use client";

import { getNotes, deleteNote, Note } from "@/lib/notesStorage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setNotes(getNotes());
        setIsLoading(false);
    }, []);

    const handleDelete = (id: string) => {
        deleteNote(id);
        setNotes(getNotes());
    };

    return (
        <div className="w-full flex flex-col items-center justify-center gap-4">
            <div className="text-2xl font-bold">
                Notes
            </div>
            {isLoading ? (
                <div className="w-full py-8 flex justify-center items-center">
                    <Spinner className="size-6" />
                </div>
            ) : notes.length === 0 ? (
                <div className="w-full text-center text-muted-foreground">
                    You don't have any notes yet.
                </div>
            ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <Card key={note.id}>
                            <CardContent className="flex justify-between items-start gap-2">
                                <div className="text-sm text-muted-foreground">
                                    {note.text}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(note.id)}
                                >
                                    <Trash2Icon className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )
            }
        </div >
    )
}