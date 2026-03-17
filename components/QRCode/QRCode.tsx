"use client";

import { QRCodeSVG } from "qrcode.react";
import styles from "./QRCode.module.css";

export default function QRCode({ path }: { path: string }) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${path}`
      : path;

  return (
    <div className={styles.wrapper}>
      <QRCodeSVG value={url} size={160} />
    </div>
  );
}
