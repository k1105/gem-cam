import { NextRequest, NextResponse } from "next/server";
import { getImageRowById } from "@/lib/db";
import { downloadImage } from "@/lib/google-drive";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  const { id, type } = await params;

  if (type !== "original" && type !== "generated") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const row = getImageRowById(id);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const driveId =
    type === "original" ? row.original_drive_id : row.generated_drive_id;

  if (!driveId) {
    return NextResponse.json({ error: "Image not available" }, { status: 404 });
  }

  const { buffer, mimeType } = await downloadImage(driveId);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
