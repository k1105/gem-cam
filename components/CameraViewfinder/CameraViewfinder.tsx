"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { startCamera, stopCamera, captureFrame } from "@/lib/camera";
import { sessionStore } from "@/lib/session-store";
import styles from "./CameraViewfinder.module.css";

type Phase = "camera" | "preview" | "generating" | "result" | "error";

export default function CameraViewfinder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("camera");
  const [captured, setCaptured] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const releaseCamera = useCallback(() => {
    if (streamRef.current) {
      stopCamera(streamRef.current, videoRef.current);
      streamRef.current = null;
    }
  }, []);

  const initCamera = useCallback(async () => {
    releaseCamera();
    try {
      setErrorMsg(null);
      if (videoRef.current) {
        streamRef.current = await startCamera(videoRef.current);
      }
    } catch {
      setErrorMsg("カメラにアクセスできません");
      setPhase("error");
    }
  }, [releaseCamera]);

  // Mount/unmount only — guaranteed cleanup on navigation
  useEffect(() => {
    initCamera();
    return () => {
      releaseCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const dataUrl = captureFrame(videoRef.current);
    setCaptured(dataUrl);
    releaseCamera();
    setPhase("preview");
  };

  const handleRetake = () => {
    setCaptured(null);
    setGenerated(null);
    setErrorMsg(null);
    setPhase("camera");
    initCamera();
  };

  const handleGenerate = async () => {
    if (!captured) return;
    setPhase("generating");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: captured }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setGenerated(data.imageDataUrl);
      sessionStore.add(data.imageDataUrl);
      setPhase("result");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "画像生成に失敗しました");
      setPhase("error");
    }
  };

  const handleDownload = () => {
    if (!generated) return;
    const a = document.createElement("a");
    a.href = generated;
    a.download = `gemcam-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className={styles.viewfinder}>
      {/* video is always in the DOM so videoRef is stable */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={styles.video}
        style={{ display: phase === "camera" ? "block" : "none" }}
      />

      {phase === "camera" && (
        <div className={styles.actions}>
          <button className={styles.shutter} onClick={handleCapture}>
            <span className={styles.shutterInner} />
          </button>
        </div>
      )}

      {phase === "preview" && captured && (
        <>
          <img src={captured} alt="Captured" className={styles.preview} />
          <div className={styles.actions}>
            <button className={styles.button} onClick={handleRetake}>
              撮り直す
            </button>
            <button className={styles.button} onClick={handleGenerate}>
              生成する
            </button>
          </div>
        </>
      )}

      {phase === "generating" && (
        <div className={styles.generating}>
          <div className={styles.spinner} />
          <p className={styles.generatingText}>画像を生成中…</p>
        </div>
      )}

      {phase === "result" && generated && (
        <>
          <img src={generated} alt="Generated" className={styles.preview} />
          <div className={styles.actions}>
            <button className={styles.button} onClick={handleRetake}>
              もう一度撮る
            </button>
            <button className={styles.button} onClick={handleDownload}>
              保存
            </button>
          </div>
        </>
      )}

      {phase === "error" && (
        <>
          <p className={styles.error}>{errorMsg}</p>
          <div className={styles.actions}>
            <button className={styles.button} onClick={handleRetake}>
              やり直す
            </button>
          </div>
        </>
      )}
    </div>
  );
}
