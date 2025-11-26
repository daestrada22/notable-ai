"use client";

import { useRef, useState } from "react";

export function useRecordAudio() {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    async function startRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Media devices not supported. Make sure you're on HTTPS.");
        }

        const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName });
        if (permissionStatus.state === "denied") {
            throw new Error("Microphone permission denied. Please allow access in browser settings.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
        };

        mediaRecorder.start();
        setIsRecording(true);
    }

    function stopRecording(): Promise<Blob | null> {
        const mediaRecorder = mediaRecorderRef.current;
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            return Promise.resolve(null);
        }

        return new Promise((resolve) => {
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                mediaRecorder.stream.getTracks().forEach((track) => track.stop());
                resolve(audioBlob);
            };

            mediaRecorder.stop();
            setIsRecording(false);
        });
    }

    return {
        startRecording,
        stopRecording,
        isRecording,
    };
}