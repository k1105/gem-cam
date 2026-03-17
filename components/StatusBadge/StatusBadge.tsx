import { ImageStatus } from "@/lib/types";
import styles from "./StatusBadge.module.css";

const statusLabels: Record<ImageStatus, string> = {
  pending: "待機中",
  processing: "処理中",
  completed: "完了",
  failed: "失敗",
};

export default function StatusBadge({ status }: { status: ImageStatus }) {
  if (status === "completed") return null;

  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
