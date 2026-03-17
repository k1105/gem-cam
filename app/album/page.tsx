"use client";

import { useSyncExternalStore } from "react";
import { sessionStore } from "@/lib/session-store";
import styles from "./page.module.css";

export default function AlbumPage() {
  const images = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getAll,
    sessionStore.getAll
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>アルバム</h1>
      {images.length === 0 ? (
        <p className={styles.empty}>まだ画像がありません</p>
      ) : (
        <div className={styles.grid}>
          {images.map((img) => (
            <div key={img.id} className={styles.item}>
              <img src={img.dataUrl} alt="" className={styles.thumb} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
