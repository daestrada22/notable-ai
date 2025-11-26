"use client";

import { getCorrections, deleteCorrection, Correction } from "@/lib/correctionsStorage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2Icon, ArrowRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function ProperNounsPage() {
    const [corrections, setCorrections] = useState<Correction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setCorrections(getCorrections());
        setIsLoading(false);
    }, []);

    const handleDelete = (id: string) => {
        deleteCorrection(id);
        setCorrections(getCorrections());
    };

    return (
        <div className="w-full flex flex-col items-center justify-center gap-4">
            <div className="text-2xl font-bold">
                Proper Noun Corrections
            </div>
            {isLoading ? (
                <div className="w-full py-8 flex justify-center items-center">
                    <Spinner className="size-6" />
                </div>
            ) : corrections.length === 0 ? (
                <div className="w-full text-center text-muted-foreground">
                    You haven't made any corrections yet.
                </div>
            ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {corrections.map((correction) => (
                        <Card key={correction.id}>
                            <CardContent className="flex flex-col gap-3 h-full justify-between">
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                                    <span className="text-muted-foreground line-through text-start">
                                        {correction.original}
                                    </span>
                                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium text-end">
                                        {correction.corrected}
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(correction.id)}
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
