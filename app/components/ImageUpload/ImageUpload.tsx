"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./ImageUpload.module.css";
import {
  DashboardImage,
  createDashboardImage,
  deleteDashboardImage,
  getAllDashboardImages,
} from "@/app/lib/dashboardImages";

type UploadResult = {
  public_id: string;
  secure_url: string;
  original_filename?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
};

type ImageUploadProps = {
  onSelectImage?: (image: DashboardImage | null) => void;
  onSelectMultiple?: (images: DashboardImage[]) => void;
  initialSelectedUrl?: string;
  initialSelectedUrls?: string[];
  multiSelect?: boolean;
};

export default function ImageUpload({ onSelectImage, onSelectMultiple, initialSelectedUrl, initialSelectedUrls, multiSelect }: ImageUploadProps) {
  const [images, setImages] = useState<DashboardImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialUrlsRef = useRef<string[] | null>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || "";
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER?.trim() || "dashboard-images";

  const configReady = useMemo(() => Boolean(cloudName && uploadPreset), [cloudName, uploadPreset]);
  const selectedImage = images.find((image) => image.id === selectedImageId) ?? null;

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

  const getTransformedUrl = (url: string, width = 320, height = 240) => {
    try {
      // Insert Cloudinary transform after '/upload/' to create a small thumbnail for previews
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/w_${width},h_${height},c_fill/${parts[1]}`;
      }
    } catch (e) {
      // fallback to original
    }
    return url;
  };

  useEffect(() => {
    const loadImages = async () => {
      setLoadingImages(true);
      try {
        const data = await getAllDashboardImages();
        setImages(data);
      } catch (loadError) {
        console.error("Error loading dashboard images:", loadError);
        setError("Unable to load uploaded images right now.");
      } finally {
        setLoadingImages(false);
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (multiSelect) {
      const selected = images.filter((img) => selectedIds.has(img.id));
      onSelectMultiple?.(selected);
    } else {
      onSelectImage?.(selectedImage);
    }
  }, [onSelectImage, selectedImage, onSelectMultiple, images, selectedIds, multiSelect]);

  useEffect(() => {
    if (!images.length) return;

    if (initialSelectedUrl) {
      const matchedImage = images.find((image) => image.url === initialSelectedUrl);
      if (matchedImage && matchedImage.id !== selectedImageId) {
        setSelectedImageId(matchedImage.id || null);
      }
    }

    if (initialSelectedUrls && initialSelectedUrls.length) {
      const previous = initialUrlsRef.current || [];
      const next = [...initialSelectedUrls].sort();
      const previousSorted = [...previous].sort();
      const urlsChanged = previousSorted.length !== next.length || next.some((url, index) => url !== previousSorted[index]);

      if (urlsChanged) {
        initialUrlsRef.current = next;
        const ids = new Set<string>();
        initialSelectedUrls.forEach((u) => {
          const m = images.find((image) => image.url === u);
          if (m) ids.add(m.id);
        });
        const currentIds = [...selectedIds].sort().join(";");
        const nextIds = [...ids].sort().join(";");
        if (currentIds !== nextIds) {
          setSelectedIds(ids);
        }
      }
    }
  }, [images, initialSelectedUrl, initialSelectedUrls, selectedIds, selectedImageId]);

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Media upload failed.");
    }

    return response.json() as Promise<UploadResult>;
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (!files.length || uploading) {
      return;
    }

    if (!configReady) {
      setError("Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable uploads.");
      event.target.value = "";
      return;
    }

    // filter out oversized files
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length) {
      setError(`Some files exceed ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB and were not uploaded.`);
      // keep only acceptable files
      files.splice(0, files.length, ...files.filter((f) => f.size <= MAX_FILE_SIZE));
      if (!files.length) {
        event.target.value = "";
        return;
      }
    }

    setUploading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const uploadResult = await uploadToCloudinary(file);
          return createDashboardImage({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            fileName: uploadResult.original_filename || file.name,
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            bytes: uploadResult.bytes,
          });
        }),
      );

      const nextImages = [...uploadedImages, ...images];
      setImages(nextImages);
      if (multiSelect) {
        const ids = new Set(selectedIds);
        uploadedImages.forEach((i) => ids.add(i.id));
        setSelectedIds(ids);
      } else {
        setSelectedImageId(uploadedImages[0]?.id ?? null);
      }
      setStatusMessage(`${uploadedImages.length} image${uploadedImages.length > 1 ? "s" : ""} uploaded successfully.`);
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      setError("Upload failed. Check your Cloudinary preset and try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSelectImage = (image: DashboardImage) => {
    if (multiSelect) {
      const next = new Set(selectedIds);
      if (next.has(image.id)) next.delete(image.id);
      else next.add(image.id);
      setSelectedIds(next);
      setStatusMessage(`${next.size} image${next.size === 1 ? "" : "s"} selected.`);
    } else {
      setSelectedImageId(image.id || null);
      setStatusMessage(`Selected ${image.fileName}.`);
    }
  };

  const handleDeleteImage = async (image: DashboardImage) => {
    const confirmed = window.confirm(`Delete ${image.fileName} from the uploaded images list?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteDashboardImage(image.id);
      const nextImages = images.filter((currentImage) => currentImage.id !== image.id);
      setImages(nextImages);

      if (selectedImageId === image.id) {
        setSelectedImageId(null);
      }

      setStatusMessage(`${image.fileName} deleted.`);
    } catch (deleteError) {
      console.error("Image delete error:", deleteError);
      setError("Could not delete the selected image.");
    }
  };

  const handleCopyImageUrl = async () => {
    if (!selectedImage?.url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedImage.url);
      setStatusMessage("Image URL copied to clipboard.");
    } catch (clipboardError) {
      console.error("Clipboard error:", clipboardError);
      setError("Could not copy the image URL.");
    }
  };

  return (
    <div className={styles.uploadShell}>
      <div className={styles.uploadToolbar}>
        <div>
          <h3>Upload image</h3>
          <p>
            Upload images to the gallery, then pick from the saved gallery when you need an image in another section.
          </p>
        </div>
        <label className={styles.uploadButton}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            aria-label="Upload images"
          />
          {uploading ? "Uploading..." : "Choose images"}
        </label>
      </div>

      {!configReady ? (
        <div className={styles.notice}>
          Enable uploads in your environment to turn on uploads.
        </div>
      ) : null}

      {error ? <div className={styles.error}>{error}</div> : null}
      {statusMessage ? <div className={styles.success}>{statusMessage}</div> : null}

      {selectedImage ? (
        <div className={styles.selectedCard}>
          <div className={styles.selectedPreview}>
            <Image src={getTransformedUrl(selectedImage.url, 480, 320)} alt={selectedImage.fileName} fill sizes="(max-width: 768px) 100vw, 320px" />
          </div>
          <div className={styles.selectedMeta}>
            <span>Selected image</span>
            <strong>{selectedImage.fileName}</strong>
            <p>{selectedImage.url}</p>
            <div className={styles.actionRow}>
              <button type="button" className={styles.secondaryButton} onClick={handleCopyImageUrl}>
                Copy URL
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.galleryHeader}>
        <h4>Uploaded images</h4>
        <span>{images.length} saved</span>
      </div>

      {loadingImages ? (
        <div className={styles.loadingState}>Loading saved images...</div>
      ) : images.length ? (
        <div className={styles.galleryGrid}>
          {images.map((image) => (
            (() => {
              const isSelected = multiSelect ? selectedIds.has(image.id) : selectedImageId === image.id;

              return (
            <div
              key={image.id}
              className={`${styles.galleryCard} ${isSelected ? styles.galleryCardActive : ""}`}
              onClick={() => handleSelectImage(image)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelectImage(image);
                }
              }}
            >
              <span className={`${styles.selectionBox} ${isSelected ? styles.selectionBoxActive : ""}`} aria-hidden>
                {isSelected ? <span className={styles.selectionCheck}>✓</span> : null}
              </span>
              <span
                className={styles.galleryDeleteButton}
                role="button"
                tabIndex={0}
                aria-label={`Delete ${image.fileName}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void handleDeleteImage(image);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    void handleDeleteImage(image);
                  }
                }}
              >
                ×
              </span>
              <div className={styles.galleryPreview}>
                <Image
                  src={getTransformedUrl(image.url, 240, 240)}
                  alt={image.fileName}
                  fill
                  className={styles.galleryImage}
                  sizes="(max-width: 768px) 50vw, 240px"
                />
              </div>
              <div className={styles.galleryInfo}>
                <strong>{image.fileName}</strong>
                <span>{image.format || "image"}</span>
              </div>
            </div>
              );
            })()
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>No images uploaded yet. Add the first one to start your dashboard image library.</div>
      )}
    </div>
  );
}