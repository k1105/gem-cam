"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  startCamera,
  stopCamera,
  captureFrame,
  readFileAsDataUrl,
  type FacingMode,
} from "@/lib/camera";
import { sessionStore } from "@/lib/session-store";
import styles from "./CameraViewfinder.module.css";

type Phase = "camera" | "preview" | "generating" | "result" | "error";

export default function CameraViewfinder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const facingRef = useRef<FacingMode>("environment");
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
        streamRef.current = await startCamera(
          videoRef.current,
          facingRef.current
        );
      }
    } catch {
      setErrorMsg("カメラにアクセスできません");
      setPhase("error");
    }
  }, [releaseCamera]);

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

  const handleFlip = () => {
    facingRef.current =
      facingRef.current === "environment" ? "user" : "environment";
    initCamera();
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCaptured(dataUrl);
      releaseCamera();
      setPhase("preview");
    } catch {
      setErrorMsg("ファイルの読み込みに失敗しました");
      setPhase("error");
    }
    // reset so the same file can be selected again
    e.target.value = "";
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
      setErrorMsg(
        err instanceof Error ? err.message : "画像生成に失敗しました"
      );
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />

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
          <button
            className={styles.iconButton}
            onClick={handlePickFile}
            aria-label="写真を選択"
          >
            <Icon icon="mdi:image-outline" width={28} height={28} />
          </button>
          <button className={styles.shutter} onClick={handleCapture}>
            <span className={styles.shutterInner} />
          </button>
          <button
            className={styles.iconButton}
            onClick={handleFlip}
            aria-label="カメラ切替"
          >
            <Icon icon="mdi:camera-flip-outline" width={28} height={28} />
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
