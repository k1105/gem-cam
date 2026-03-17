export type SessionImage = {
  id: string;
  dataUrl: string;
  createdAt: number;
};

type Listener = () => void;

let images: SessionImage[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((fn) => fn());
}

export const sessionStore = {
  add(dataUrl: string) {
    images = [
      { id: crypto.randomUUID(), dataUrl, createdAt: Date.now() },
      ...images,
    ];
    emit();
  },

  getAll(): SessionImage[] {
    return images;
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
