export type ImageStatus = "pending" | "processing" | "completed" | "failed";

export interface ImageItem {
  id: string;
  originalUrl: string;
  generatedUrl: string | null;
  status: ImageStatus;
  createdAt: string;
}
