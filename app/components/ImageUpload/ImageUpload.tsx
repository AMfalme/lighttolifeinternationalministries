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

type SelectedPreviewImage = {
  id: string;
  url: string;
  fileName: string;
  format?: string;
};

const getPreviewFileName = (url: string, fallbackLabel: string) => {
  try {
    const pathname = new URL(url).pathname;
    const fallbackName = decodeURIComponent(pathname.split("/").pop() || "").trim();
    return fallbackName || fallbackLabel;
  } catch {
    return fallbackLabel;
  }
};

const buildFallbackSelectedImage = (url: string, index: number): DashboardImage => {
  let fileName = `Selected image ${index + 1}`;

  try {
    const pathname = new URL(url).pathname;
    const fallbackName = decodeURIComponent(pathname.split("/").pop() || "").trim();
    if (fallbackName) {
      fileName = fallbackName;
    }
  } catch {
    // Keep the generic label when the URL is malformed.
  }

  const now = new Date().toISOString();

  return {
    id: `selected-${index}-${url}`,
    url,
    publicId: url,
    fileName,
    createdAt: now,
    updatedAt: now,
  };
};

type ImageUploadProps = {
  onSelectImage?: (image: DashboardImage | null) => void;
  onSelectMultiple?: (images: DashboardImage[]) => void;
  initialSelectedUrl?: string;
  initialSelectedUrls?: string[];
  multiSelect?: boolean;
  title?: string;
  description?: string;
  selectedLabel?: string;
  selectedSummary?: string;
  libraryTitle?: string;
  libraryDescription?: string;
  uploadButtonLabel?: string;
};

export default function ImageUpload({
  onSelectImage,
  onSelectMultiple,
  initialSelectedUrl,
  initialSelectedUrls,
  multiSelect,
  title,
  description,
  selectedLabel,
  selectedSummary,
  libraryTitle,
  libraryDescription,
  uploadButtonLabel,
}: ImageUploadProps) {
  const [images, setImages] = useState<DashboardImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialSelectionKeyRef = useRef<string>("");
  const lastAppliedSingleSelectionRef = useRef<string>("");
  const lastEmittedMultiSelectionRef = useRef<string>("");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || "";
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER?.trim() || "dashboard-images";

  const configReady = useMemo(() => Boolean(cloudName && uploadPreset), [cloudName, uploadPreset]);
  const selectedImage = useMemo(() => {
    if (multiSelect) {
      return null;
    }

    return images.find((image) => image.id === selectedImageId) ?? (selectedUrl ? buildFallbackSelectedImage(selectedUrl, 0) : null);
  }, [images, multiSelect, selectedImageId, selectedUrl]);
  const selectedImageIds = useMemo(() => {
    if (!multiSelect) {
      return new Set<string>();
    }

    return new Set(images.filter((image) => selectedUrls.includes(image.url)).map((image) => image.id));
  }, [images, multiSelect, selectedUrls]);
  const selectedPreviewImages = useMemo(() => {
    if (multiSelect) {
      return selectedUrls.map((url, index) => ({
        id: `selected-${encodeURIComponent(url)}`,
        url,
        fileName: getPreviewFileName(url, `Selected image ${index + 1}`),
      }));
    }

    if (selectedUrl) {
      return [
        {
          id: `selected-${encodeURIComponent(selectedUrl)}`,
          url: selectedUrl,
          fileName: getPreviewFileName(selectedUrl, selectedImage?.fileName || "Selected image"),
          format: selectedImage?.format,
        } satisfies SelectedPreviewImage,
      ];
    }

    return [];
  }, [multiSelect, selectedImage?.fileName, selectedImage?.format, selectedUrl, selectedUrls]);

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
    if (!multiSelect) {
      return;
    }

    const normalizedSelectionKey = (initialSelectedUrls || []).slice().sort().join("|");
    if (!normalizedSelectionKey) {
      initialSelectionKeyRef.current = "";
      setSelectedUrls([]);
      return;
    }

    if (!images.length) {
      return;
    }

    if (initialSelectionKeyRef.current === normalizedSelectionKey) {
      return;
    }

    const ids = new Set<string>();
    (initialSelectedUrls || []).forEach((url) => {
      ids.add(url);
    });

    initialSelectionKeyRef.current = normalizedSelectionKey;
    setSelectedUrls(Array.from(ids));
  }, [images, initialSelectedUrls, multiSelect]);

  useEffect(() => {
    if (!multiSelect) {
      return;
    }

    const selectionKey = selectedUrls.slice().sort().join("|");
    if (lastEmittedMultiSelectionRef.current === selectionKey) {
      return;
    }

    lastEmittedMultiSelectionRef.current = selectionKey;
    const selected = selectedUrls.map((url, index) => images.find((img) => img.url === url) ?? buildFallbackSelectedImage(url, index));
    onSelectMultiple?.(selected);
  }, [images, onSelectMultiple, multiSelect, selectedUrls]);

  useEffect(() => {
    if (multiSelect) {
      return;
    }

    const nextInitialSelection = initialSelectedUrl || "";
    if (lastAppliedSingleSelectionRef.current === nextInitialSelection) {
      return;
    }

    lastAppliedSingleSelectionRef.current = nextInitialSelection;

    if (!nextInitialSelection) {
      setSelectedImageId(null);
      setSelectedUrl("");
      onSelectImage?.(null);
      return;
    }

    const matchedImage = images.find((image) => image.url === nextInitialSelection);
    setSelectedImageId(matchedImage?.id || null);
    setSelectedUrl(nextInitialSelection);
    onSelectImage?.(matchedImage ?? buildFallbackSelectedImage(nextInitialSelection, 0));
  }, [images, initialSelectedUrl, multiSelect, onSelectImage]);

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
        const nextUrls = Array.from(new Set([...selectedUrls, ...uploadedImages.map((i) => i.url)]));
        setSelectedUrls(nextUrls);
      } else {
        const uploadedImage = uploadedImages[0] ?? null;
        setSelectedImageId(uploadedImage?.id ?? null);
        setSelectedUrl(uploadedImage?.url ?? "");
        onSelectImage?.(uploadedImage);
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
      const next = selectedUrls.includes(image.url)
        ? selectedUrls.filter((url) => url !== image.url)
        : [...selectedUrls, image.url];
      setSelectedUrls(next);
      lastEmittedMultiSelectionRef.current = next.slice().sort().join("|");
      setStatusMessage(`${next.length} image${next.length === 1 ? "" : "s"} selected.`);
    } else {
      const nextSelectedId = selectedImageId === image.id && selectedUrl === image.url ? null : image.id;
      setSelectedImageId(nextSelectedId);
      setSelectedUrl(nextSelectedId ? image.url : "");
      onSelectImage?.(nextSelectedId ? image : null);
      setStatusMessage(nextSelectedId ? `Selected ${image.fileName}.` : "Selection cleared.");
    }
  };

  const clearSingleSelection = () => {
    if (multiSelect) {
      return;
    }

    setSelectedImageId(null);
    setSelectedUrl("");
    onSelectImage?.(null);
    setStatusMessage("Selection cleared.");
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

      if (multiSelect) {
        setSelectedUrls((current) => {
          const next = current.filter((url) => url !== image.url);
          lastEmittedMultiSelectionRef.current = next.slice().sort().join("|");
          onSelectMultiple?.(next.map((url, index) => nextImages.find((currentImage) => currentImage.url === url) ?? buildFallbackSelectedImage(url, index)));
          return next;
        });
      } else if (selectedImageId === image.id || selectedUrl === image.url) {
        setSelectedImageId(null);
        setSelectedUrl("");
        onSelectImage?.(null);
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
          <h3>{title || "Upload image"}</h3>
          <p>
            {description || "Upload images to the gallery, then pick from the saved gallery when you need an image in another section."}
          </p>
        </div>
        <label className={styles.uploadButton}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            aria-label={uploadButtonLabel || title || "Upload images"}
          />
          {uploading ? "Uploading..." : uploadButtonLabel || "Choose images"}
        </label>
      </div>

      {!configReady ? (
        <div className={styles.notice}>
          Enable uploads in your environment to turn on uploads.
        </div>
      ) : null}

      {error ? <div className={styles.error}>{error}</div> : null}
      {statusMessage ? <div className={styles.success}>{statusMessage}</div> : null}

      {selectedPreviewImages.length ? (
        <div className={styles.selectedCard}>
          <div className={styles.selectedThumbList}>
            {selectedPreviewImages.map((image) => (
              <div
                key={image.id}
                className={styles.selectedThumb}
                role={!multiSelect ? "button" : undefined}
                tabIndex={!multiSelect ? 0 : undefined}
                onClick={!multiSelect ? clearSingleSelection : undefined}
                onKeyDown={!multiSelect ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    clearSingleSelection();
                  }
                } : undefined}
                aria-label={!multiSelect ? `Clear selected image ${image.fileName}` : undefined}
              >
                <Image unoptimized src={getTransformedUrl(image.url, 120, 120)} alt={image.fileName} fill sizes="(max-width: 768px) 50vw, 120px" className={styles.galleryImage} />
                {!multiSelect ? <span className={styles.selectedOverlay}>Click to clear</span> : null}
              </div>
            ))}
          </div>
          <div className={styles.selectedMeta}>
            <span>{multiSelect ? selectedLabel || `${selectedPreviewImages.length} images already selected` : selectedLabel || "Selected image"}</span>
            <strong>{multiSelect ? selectedLabel || "Already selected images" : selectedPreviewImages[0].fileName}</strong>
            <p>
              {multiSelect
                ? selectedPreviewImages
                    .slice(0, 3)
                    .map((image) => image.fileName)
                    .join(", ")
                : `Image URL: ${selectedPreviewImages[0].url}`}
              {multiSelect && selectedPreviewImages.length > 3 ? ` +${selectedPreviewImages.length - 3} more` : ""}
            </p>
            <p className={styles.selectedHint}>{selectedSummary || (multiSelect ? "These images are already attached to the member. The grid shows exactly what is currently saved." : "This is the image that will be used for the single profile slot.")}</p>
            {!multiSelect ? (
              <div className={styles.actionRow}>
                <button type="button" className={styles.secondaryButton} onClick={handleCopyImageUrl}>
                  Copy URL
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={styles.libraryHeader}>
        <div>
          <h4>{libraryTitle || "Uploaded images"}</h4>
          <p>{libraryDescription || "Browse the full image library and pick the files you want to use."}</p>
        </div>
        <div className={styles.libraryActions}>
          <span>{images.length} saved</span>
          <button type="button" className={styles.libraryButton} onClick={() => setIsLibraryOpen(true)} disabled={!images.length}>
            Browse uploaded images
          </button>
        </div>
      </div>

      {loadingImages ? <div className={styles.loadingState}>Loading saved images...</div> : null}

      {isLibraryOpen ? (
        <div className={styles.modalOverlay} onClick={() => setIsLibraryOpen(false)}>
          <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>{libraryTitle || "Uploaded images"}</h3>
                <p>{libraryDescription || "Click an image to select or deselect it. Use the delete icon to remove it from the library."}</p>
              </div>
              <button type="button" className={styles.modalCloseButton} onClick={() => setIsLibraryOpen(false)}>
                Close
              </button>
            </div>

            {images.length ? (
              <div className={styles.libraryGrid}>
                {images.map((image) => {
                  const isSelected = multiSelect ? selectedImageIds.has(image.id) : selectedImageId === image.id;

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
                          unoptimized
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
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>No images uploaded yet. Add the first one to start your dashboard image library.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}