import Image from "next/image";
import Link from "next/link";
import { ImageItem } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import styles from "./ImageGrid.module.css";

export default function ImageGrid({ images }: { images: ImageItem[] }) {
  return (
    <div className={styles.grid}>
      {images.map((item) => (
        <Link
          key={item.id}
          href={`/album/${item.id}`}
          className={styles.cell}
        >
          <Image
            src={item.generatedUrl ?? item.originalUrl}
            alt={`Image ${item.id}`}
            width={200}
            height={200}
            className={styles.thumbnail}
          />
          {item.status !== "completed" && (
            <div className={styles.overlay}>
              <StatusBadge status={item.status} />
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
