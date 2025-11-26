"use client";

import { ProperNoun } from "@/app/api/transcribe/utils";
import { Button } from "./ui/button";
import { useEffect, useRef, useState, useMemo } from "react";
import { cn, segmentTranscription } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { saveNote } from "@/lib/notesStorage";
import { saveCorrection } from "@/lib/correctionsStorage";
import { Input } from "./ui/input";

/**
 * This component is used to highlight the proper nouns in the transcription and display the correction options.
 * @param properNoun - The proper noun to highlight.
 * @returns 
 */
function ProperNounWithOptions({ properNoun, handleCorrection }: { properNoun: ProperNoun, handleCorrection: (correction: string) => void }) {
    const [open, setOpen] = useState(false);
    const [customValue, setCustomValue] = useState("");
    const colorClass = {
        person: "bg-gradient-to-r from-blue-800 to-cyan-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent",
        place: "bg-gradient-to-r from-green-800 to-teal-600 dark:from-green-400 dark:to-teal-300 bg-clip-text text-transparent",
        company: "bg-gradient-to-r from-purple-800 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-300 bg-clip-text text-transparent",
        brand: "bg-gradient-to-r from-orange-800 to-orange-600 dark:from-orange-400 dark:to-red-300 bg-clip-text text-transparent",
        other: "bg-gradient-to-r from-amber-800 to-orange-600 dark:from-amber-400 dark:to-orange-300 bg-clip-text text-transparent",
    }[properNoun.type];

    const onSelectCorrection = (correction: string) => {
        handleCorrection(correction);
        setOpen(false);
        setCustomValue("");
    };

    const onSubmitCustom = () => {
        if (customValue.trim()) {
            onSelectCorrection(customValue.trim());
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onSubmitCustom();
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className={cn("rounded cursor-pointer hover:opacity-80", colorClass)}>
                {properNoun.original}
            </PopoverTrigger>
            <PopoverContent>
                <div className="flex flex-col gap-2 text-center">
                    <span className="text-xs text-muted-foreground">Edit by typing {properNoun.corrections.length > 0 ? "or selecting a suggestion" : ""}</span>
                    <div className="flex gap-1">
                        <Input
                            placeholder="Custom correction..."
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            onKeyDown={onKeyDown}
                            className="text-xs h-8"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={onSubmitCustom}
                            disabled={!customValue.trim()}
                        >
                            <CheckIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    {properNoun.corrections.map((correction) => (
                        <Button key={correction} variant="outline" className="w-full text-xs" onClick={() => onSelectCorrection(correction)}>
                            {correction}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>

    );
}

/**
 * This component is used to display the transcription and allow the user to correct proper nouns via a popover.
 * @param transcription - The transcription to display.
 * @param properNouns - The proper nouns to highlight.
 * @returns 
 */
export function TranscribedText({ transcription, properNouns }: { transcription: string, properNouns: ProperNoun[] }) {
    const [text, setText] = useState(transcription);
    const divRef = useRef<HTMLDivElement>(null);

    // Update the highlighted content for every new transcription and proper nouns
    const highlightedContent = useMemo(
        () => segmentTranscription(text, properNouns),
        [text, properNouns]
    );

    // Sync from props when transcription changes from parent
    useEffect(() => {
        setText(transcription);
    }, [transcription]);

    // Handle correction selection from popover
    const handleCorrection = (original: string, correction: string) => {
        setText((prev) => prev.replace(original, correction));
        saveCorrection(original, correction);
    };

    // Handle saving the note to local storage
    const handleSaveNote = () => {
        if (!text) {
            return;
        }

        saveNote(text);
        toast.success("Note saved successfully! Record a new note :)");
    }

    return (
        <div className="grid w-full gap-2 justify-items-end">
            <div
                ref={divRef}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {Array.isArray(highlightedContent)
                    ? highlightedContent.map((segment, i) =>
                        typeof segment === "string" ? (
                            <span key={i}>{segment}</span>
                        ) : (
                            <ProperNounWithOptions key={i} properNoun={segment} handleCorrection={(correction) => handleCorrection(segment.original, correction)} />
                        )
                    )
                    : highlightedContent || <span className="text-muted-foreground">Transcription will appear here...</span>
                }
            </div>
            <div className="flex gap-2 justify-between">
                <Button className="w-fit" disabled={!text} onClick={handleSaveNote}>
                    Save Note <ArrowRightIcon />
                </Button>
            </div>

        </div>
    );
}