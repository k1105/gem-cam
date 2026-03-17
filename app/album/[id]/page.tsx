import Image from "next/image";
import { notFound } from "next/navigation";
import { getImageById } from "@/lib/images";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import QRCode from "@/components/QRCode/QRCode";
import styles from "./page.module.css";

const statusLabels: Record<string, string> = {
  pending: "待機中",
  processing: "処理中",
  completed: "完了",
  failed: "失敗",
};

export default async function ImageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const image = getImageById(id);

  if (!image) {
    notFound();
  }

  const displayUrl = image.generatedUrl ?? image.originalUrl;
  const date = new Date(image.createdAt);

  return (
    <div className={styles.page}>
      <div className={styles.imageWrapper}>
        <Image
          src={displayUrl}
          alt={`Image ${image.id}`}
          width={400}
          height={400}
          className={styles.mainImage}
          priority
        />
      </div>

      <div className={styles.info}>
        <div className={styles.row}>
          <span>ステータス</span>
          <span>
            {image.status === "completed"
              ? statusLabels[image.status]
              : <StatusBadge status={image.status} />}
          </span>
        </div>
        <div className={styles.row}>
          <span>撮影日時</span>
          <span>{date.toLocaleString("ja-JP")}</span>
        </div>
      </div>

      {image.generatedUrl && (
        <div className={styles.originalSection}>
          <p className={styles.sectionLabel}>オリジナル</p>
          <Image
            src={image.originalUrl}
            alt={`Original ${image.id}`}
            width={200}
            height={200}
            className={styles.originalImage}
          />
        </div>
      )}

      <QRCode path={`/album/${image.id}`} />
    </div>
  );
}
