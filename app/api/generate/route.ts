import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { dataUrl } = (await req.json()) as { dataUrl: string };

    const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid data URL" }, { status: 400 });
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], "base64");

    const generated = await generateImage(buffer, mimeType);

    const generatedDataUrl = `data:${generated.mimeType};base64,${generated.buffer.toString("base64")}`;

    return NextResponse.json({ imageDataUrl: generatedDataUrl });
  } catch (err) {
    console.error("[generate]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
