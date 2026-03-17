"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AlbumRefresher({ hasPending }: { hasPending: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasPending) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [hasPending, router]);

  return null;
}
