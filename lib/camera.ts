export type FacingMode = "user" | "environment";

export async function startCamera(
  video: HTMLVideoElement,
  facingMode: FacingMode = "environment"
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode },
  });
  video.srcObject = stream;
  await video.play();
  return stream;
}

export function stopCamera(
  stream: MediaStream,
  video?: HTMLVideoElement | null
): void {
  stream.getTracks().forEach((track) => track.stop());
  if (video) {
    video.srcObject = null;
  }
}

export function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
