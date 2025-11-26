"use client";

import { Button } from "@/components/ui/button";
import { MicIcon, SquareIcon } from "lucide-react";
import { useRecordAudio } from "../hooks/useRecordAudio";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ProperNoun } from "./api/transcribe/utils";
import { TranscribedText } from "@/components/TranscribedText";
import { getCorrections } from "@/lib/correctionsStorage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";

const RECORDING_WORDS = ["Thinking", "Listening", "Spelunking", "Transcribing", "Improving", "Braining", "Hearing"];

/**
 * The main/landing page of the app. Offers the user the ability to record audio and transcribe it into a note.
 * @returns 
 */
export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const { startRecording, stopRecording, isRecording } = useRecordAudio();

  // Use this mutation to send the audio blob to the server for transcription and proper noun recognition
  const { mutate, data, isPending, isSuccess, reset } = useMutation({
    mutationFn: async (audioBlob: Blob | null) => {
      if (!audioBlob) {
        throw new Error("No audio blob provided");
      }

      const formData = new FormData();

      formData.append("audioFile", audioBlob, "recording.webm");

      // Include user corrections so the model learns from past mistakes
      const corrections = getCorrections();
      if (corrections.length > 0) {
        const simplifiedCorrections = corrections.map(({ original, corrected }) => ({ original, corrected }));
        formData.append("corrections", JSON.stringify(simplifiedCorrections));
      }

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      return (await response.json());
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to transcribe audio");
    },
  });

  // Update the word index every 2 seconds for the loading animation when the mutation is pending
  useEffect(() => {
    if (!isPending) {
      setWordIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % RECORDING_WORDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPending]);

  // Toggle the recording state and send the audio blob to the server once the user stops recording
  async function toggleRecording() {
    if (isRecording) {
      const audioBlob = await stopRecording();
      mutate(audioBlob);
    } else {
      try {
        reset(); // Clear previous transcription results before starting new recording
        await startRecording();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to start recording");
      }
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6">
      <div className="text-2xl font-bold">
        Note-ify your thoughts.
      </div>
      <Popover>
        <PopoverTrigger className="text-sm text-muted-foreground underline cursor-pointer">How it works</PopoverTrigger>
        <PopoverContent className="text-sm text-muted-foreground flex flex-col gap-2">
          <p>
            Click record to start recording your thoughts. Click the button again to stop recording.
            The app will transcribe your thoughts and allow you to correct proper nouns in the transcription, if applicable.
            Persons are highlighted in
            <span className="bg-gradient-to-r from-blue-800 to-cyan-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">blue</span>,
            places in <span className="bg-gradient-to-r from-green-800 to-teal-600 dark:from-green-400 dark:to-teal-300 bg-clip-text text-transparent">green</span>,
            companies in <span className="bg-gradient-to-r from-purple-800 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-300 bg-clip-text text-transparent">purple</span>,
            brands in <span className="bg-gradient-to-r from-orange-800 to-orange-600 dark:from-orange-400 dark:to-red-300 bg-clip-text text-transparent">orange</span>,
            and other
            proper nouns in <span className="bg-gradient-to-r from-amber-800 to-orange-600 dark:from-amber-400 dark:to-orange-300 bg-clip-text text-transparent">amber</span>.
          </p>

          <p>
            You can then make corrections and save notes; both are accessible in other pages of the app via the sidebar.
          </p>

          <p>
            <span className="font-bold">Note:</span> make sure your browser allows microphone access to this site!
          </p>
        </PopoverContent>
      </Popover>
      <Button
        variant="blue"
        className={cn("rounded-full size-24", isRecording && "animate-pulse")}
        onClick={() => toggleRecording()} disabled={isPending}>
        {isRecording ?
          <SquareIcon className="fill-current size-6" />
          :
          isPending ? `${RECORDING_WORDS[wordIndex]}...` : <MicIcon className="size-6" />
        }
      </Button>
      {!isRecording && !isPending && isSuccess && data && (
        <TranscribedText
          transcription={isSuccess && data ? data.transcription : ""}
          properNouns={isSuccess && data ? data.properNouns.properNouns : []}
        />
      )}
    </div >
  );
}
