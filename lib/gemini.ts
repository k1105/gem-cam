import {GoogleGenerativeAI} from "@google/generative-ai";
import {readFile} from "fs/promises";
import path from "path";

const PROMPT = `この写真に写っている人物をモチーフに、つけまつげや髪の毛を染めていた、ギャルメイクをした3DCG製のポップでコミカルなキャラクターにデフォルメされたDesigners Toyの商材写真を制作して。配色はCommercial Pop。彩度が極めて高く、原色に近い構成をしている。ポーズを誇張して、頭からつま先まで全身が入った画像にすること。ただし、2枚目の写真のユニフォームを着せてください。
重要な指示:
- 平面的な表現を避け、3DCG風の表現を徹底すること。
- 背景は完全に均一な白色で塗りつぶしてください
- 被写体と背景の境界は明確にしてください
- 背景にグラデーションや影を入れないでください
- 人物の特徴は保持すること`;

const REFERENCE_IMAGE_PATH = path.join(
  process.cwd(),
  "public/reference/costume_girl.jpg",
);

async function loadReferenceImage(): Promise<{
  data: string;
  mimeType: string;
}> {
  const buffer = await readFile(REFERENCE_IMAGE_PATH);
  return {data: buffer.toString("base64"), mimeType: "image/jpeg"};
}

export async function generateImage(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<{buffer: Buffer; mimeType: string}> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-3-pro-image-preview",
    generationConfig: {
      // @ts-expect-error responseModalities is supported but not yet in types
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  const referenceImage = await loadReferenceImage();

  const result = await model.generateContent([
    PROMPT,
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType,
      },
    },
    {
      inlineData: {
        data: referenceImage.data,
        mimeType: referenceImage.mimeType,
      },
    },
  ]);

  const parts = result.response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData) {
      return {
        buffer: Buffer.from(part.inlineData.data!, "base64"),
        mimeType: part.inlineData.mimeType ?? "image/png",
      };
    }
  }

  throw new Error("Gemini did not return an image");
}
