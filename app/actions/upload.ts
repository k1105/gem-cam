"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { insertImage, updateImageStatus } from "@/lib/db";
import { uploadImage, downloadImage } from "@/lib/google-drive";
import { generateImage } from "@/lib/gemini";

async function processInBackground(id: string) {
  try {
    const row = (await import("@/lib/db")).getImageRowById(id);
    if (!row) throw new Error("Image row not found");

    const { buffer, mimeType } = await downloadImage(row.original_drive_id);
    const generated = await generateImage(buffer, mimeType);
    const generatedDriveId = await uploadImage(
      generated.buffer,
      `generated-${id}.${generated.mimeType === "image/png" ? "png" : "jpg"}`,
      generated.mimeType
    );

    updateImageStatus(id, "completed", generatedDriveId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[processInBackground] Failed for ${id}:`, message);
    updateImageStatus(id, "failed", undefined, message);
  }
}

export async function uploadAndProcess(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");

  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const ext = mimeType === "image/png" ? "png" : "jpg";
  const id = randomUUID();

  const originalDriveId = await uploadImage(
    buffer,
    `original-${id}.${ext}`,
    mimeType
  );

  insertImage(id, originalDriveId);

  // Fire-and-forget background processing
  processInBackground(id);

  redirect("/album");
}
