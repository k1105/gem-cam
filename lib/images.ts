import { ImageItem } from "./types";
import { getAllImageRows, getImageRowById, ImageRow } from "./db";

function rowToImageItem(row: ImageRow): ImageItem {
  return {
    id: row.id,
    originalUrl: `/api/images/${row.id}/original`,
    generatedUrl: row.generated_drive_id
      ? `/api/images/${row.id}/generated`
      : null,
    status: row.status as ImageItem["status"],
    createdAt: row.created_at,
  };
}

export function getAllImages(): ImageItem[] {
  return getAllImageRows().map(rowToImageItem);
}

export function getImageById(id: string): ImageItem | undefined {
  const row = getImageRowById(id);
  if (!row) return undefined;
  return rowToImageItem(row);
}
