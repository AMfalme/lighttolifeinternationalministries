import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const toBranchKey = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-(branch|church|location|site|center|centre)$/g, "")
    .replace(/-(branch|church|location|site|center|centre)-/g, "-");

const requireAdmin = async (request: NextRequest) => {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };
  }

  const decoded = await adminAuth().verifyIdToken(token);
  const hasAdminClaim = decoded.role === "admin" || decoded.role === "super-admin";
  const hasTeamMemberClaim = decoded.role === "team-member";
  if (hasAdminClaim || hasTeamMemberClaim) {
    return { uid: decoded.uid };
  }

  const userDoc = await adminDb().collection("users").doc(decoded.uid).get();
  const role = userDoc.data()?.role;

  if (role !== "admin" && role !== "super-admin" && role !== "team-member") {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }

  return { uid: decoded.uid };
};

export async function PATCH(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const authCheck = await requireAdmin(request);
    if ("error" in authCheck) {
      return authCheck.error;
    }

    const { uid } = params;
    const body = await request.json();
    const displayName = String(body.displayName || "").trim();
    const email = String(body.email || "").trim();
    const branchLocation = String(body.branchLocation || "").trim();
    const branchAddress = String(body.branchAddress || "").trim();
    const branchDescription = String(body.branchDescription || "").trim();
    const pastorDescription = String(body.pastorDescription || "").trim();
    const pastorImageURL = String(body.pastorImageURL || "").trim();
    const pastorGallery = Array.isArray(body.pastorGallery)
      ? body.pastorGallery.map((item: string) => String(item).trim()).filter(Boolean)
      : String(body.pastorGallery || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
    const churchGallery = Array.isArray(body.churchGallery)
      ? body.churchGallery.map((item: string) => String(item).trim()).filter(Boolean)
      : String(body.churchGallery || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
    const videos = Array.isArray(body.videos)
      ? body.videos.map((v: string) => String(v).trim()).filter(Boolean)
      : String(body.videos || "")
          .split(/\n|,/) // allow newline or comma separated
          .map((item) => item.trim())
          .filter(Boolean);
    const phoneNumber = String(body.phoneNumber || "").trim();
    const photoURL = String(body.photoURL || "").trim();
    const branchKey = toBranchKey(branchLocation || uid);

    if (!displayName || !email || !branchLocation) {
      return NextResponse.json({ error: "Missing required team member fields." }, { status: 400 });
    }

    await adminAuth().updateUser(uid, {
      displayName,
      email,
      photoURL: photoURL || undefined,
    });

    await adminDb().collection("users").doc(uid).set(
      {
        displayName,
        email,
        role: "team-member",
        branchLocation,
        branchKey,
        branchAddress,
        branchDescription,
        pastorDescription,
        pastorImageURL,
        pastorGallery,
        churchGallery,
        // include videos at user-level for convenience
        videos: videos,
        phoneNumber,
        photoURL: photoURL || "",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Also update or create a branches doc for this branch
    try {
      await adminDb().collection("branches").doc(branchKey).set(
        {
          branchKey,
          branchLocation,
          branchAddress,
          branchDescription,
          pastorDescription,
          pastorImageURL,
          pastorGallery,
          gallery: churchGallery,
          videos: videos,
          // keep existing videos if any; merging will preserve
          mainImage: photoURL || pastorImageURL || "",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    } catch (e) {
      console.error("Failed to update branch document:", e);
    }

    return NextResponse.json({ uid, displayName, email, branchLocation, phoneNumber, photoURL: photoURL || "" });
  } catch (error) {
    console.error("Team member update error:", error);
    return NextResponse.json({ error: "Failed to update team member." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const authCheck = await requireAdmin(request);
    if ("error" in authCheck) {
      return authCheck.error;
    }

    const { uid } = params;
    await adminAuth().deleteUser(uid);
    await adminDb().collection("users").doc(uid).delete();

    return NextResponse.json({ uid });
  } catch (error) {
    console.error("Team member delete error:", error);
    return NextResponse.json({ error: "Failed to delete team member." }, { status: 500 });
  }
}
