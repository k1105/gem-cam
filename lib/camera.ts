export async function startCamera(
  video: HTMLVideoElement
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
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
