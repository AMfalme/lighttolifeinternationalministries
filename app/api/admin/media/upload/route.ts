import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/lib/firebase/admin";

const requireAdmin = async (request: NextRequest) => {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };
  }

  const decoded = await adminAuth().verifyIdToken(token);
  const hasAdminClaim = decoded.role === "admin" || decoded.role === "super-admin";
  const hasLeadershipClaim = decoded.role === "leadership";
  if (hasAdminClaim || hasLeadershipClaim) {
    return { uid: decoded.uid };
  }

  const userDoc = await adminDb().collection("users").doc(decoded.uid).get();
  const role = userDoc.data()?.role;

  if (role !== "admin" && role !== "super-admin" && role !== "leadership") {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }

  return { uid: decoded.uid };
};

type CloudinaryUploadResponse = {
  public_id: string;
  secure_url: string;
  original_filename?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
};

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if ("error" in authCheck) {
      return authCheck.error;
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing video file." }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || "";
    const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER?.trim() || "dashboard-images";

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 500 });
    }

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", uploadPreset);
    cloudinaryFormData.append("folder", `${folder}/videos`);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: "POST",
      body: cloudinaryFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || "Video upload failed." }, { status: response.status });
    }

    const payload = (await response.json()) as CloudinaryUploadResponse;

    return NextResponse.json({
      public_id: payload.public_id,
      secure_url: payload.secure_url,
      original_filename: payload.original_filename,
      format: payload.format,
      width: payload.width,
      height: payload.height,
      bytes: payload.bytes,
    });
  } catch (error) {
    console.error("Media upload route error:", error);
    return NextResponse.json({ error: "Failed to upload video." }, { status: 500 });
  }
}