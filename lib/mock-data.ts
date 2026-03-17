import { ImageItem } from "./types";

const mockImages: ImageItem[] = [
  {
    id: "1",
    originalUrl: "/mock/original-1.svg",
    generatedUrl: "/mock/generated-1.svg",
    status: "completed",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "2",
    originalUrl: "/mock/original-2.svg",
    generatedUrl: "/mock/generated-2.svg",
    status: "completed",
    createdAt: "2026-03-01T11:30:00Z",
  },
  {
    id: "3",
    originalUrl: "/mock/original-3.svg",
    generatedUrl: "/mock/generated-3.svg",
    status: "completed",
    createdAt: "2026-03-01T13:00:00Z",
  },
  {
    id: "4",
    originalUrl: "/mock/original-4.svg",
    generatedUrl: null,
    status: "processing",
    createdAt: "2026-03-02T09:00:00Z",
  },
  {
    id: "5",
    originalUrl: "/mock/original-5.svg",
    generatedUrl: null,
    status: "pending",
    createdAt: "2026-03-02T09:15:00Z",
  },
  {
    id: "6",
    originalUrl: "/mock/original-6.svg",
    generatedUrl: null,
    status: "failed",
    createdAt: "2026-03-02T08:00:00Z",
  },
];

export function getAllImages(): ImageItem[] {
  return mockImages;
}

export function getImageById(id: string): ImageItem | undefined {
  return mockImages.find((img) => img.id === id);
}
