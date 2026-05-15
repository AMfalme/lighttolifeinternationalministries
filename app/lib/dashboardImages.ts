export type DashboardImage = {
  id: string;
  url: string;
  publicId: string;
  fileName: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
};

type NewDashboardImage = Omit<DashboardImage, "id" | "createdAt" | "updatedAt">;

const STORAGE_KEY = "lighttolife_dashboard_images";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readImages = (): DashboardImage[] => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DashboardImage[]) : [];
  } catch {
    return [];
  }
};

const writeImages = (images: DashboardImage[]) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
};

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export const getAllDashboardImages = async () => {
  return readImages();
};

export const createDashboardImage = async (image: NewDashboardImage) => {
  const now = new Date().toISOString();
  const nextImage: DashboardImage = {
    id: createId(),
    ...image,
    createdAt: now,
    updatedAt: now,
  };

  const images = readImages();
  images.unshift(nextImage);
  writeImages(images);

  return nextImage;
};

export const deleteDashboardImage = async (id: string) => {
  const images = readImages().filter((image) => image.id !== id);
  writeImages(images);
  return id;
};