import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const requireAdmin = async (request: NextRequest) => {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };
  }

  const decoded = await adminAuth().verifyIdToken(token);
  const hasAdminClaim = decoded.role === "admin" || decoded.role === "super-admin";
  if (hasAdminClaim) {
    return { uid: decoded.uid };
  }

  const userDoc = await adminDb().collection("users").doc(decoded.uid).get();
  const role = userDoc.data()?.role;

  if (role !== "admin" && role !== "super-admin") {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }

  return { uid: decoded.uid };
};

const createTeamMember = async ({
  email,
  password,
  displayName,
  photoURL,
  branchLocation,
  branchAddress,
  branchDescription,
  pastorDescription,
  pastorImageURL,
  churchGallery,
  videos,
  phoneNumber,
}: {
  email: string;
  password: string;
  displayName: string;
  photoURL: string;
  branchLocation: string;
  branchAddress: string;
  branchDescription: string;
  pastorDescription: string;
  pastorImageURL: string;
  churchGallery: string[];
  videos: string[];
  phoneNumber: string;
}) => {
  const authUser = await adminAuth().createUser({
    email,
    password,
    displayName,
    photoURL: photoURL || undefined,
  });

  await adminAuth().setCustomUserClaims(authUser.uid, { role: "team-member" });

  await adminDb().collection("users").doc(authUser.uid).set({
    uid: authUser.uid,
    email,
    displayName,
    branchLocation,
    branchAddress,
    branchDescription,
    pastorDescription,
    pastorImageURL,
    churchGallery,
    phoneNumber,
    photoURL: photoURL || "",
    role: "team-member",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Ensure a branches document exists for this branchLocation to store branch-specific media and metadata
  try {
    // Use the auth user's UID as the branch document id to simplify associations
    const branchId = authUser.uid;
    await adminDb().collection("branches").doc(branchId).set(
      {
        branchLocation,
        branchAddress,
        branchDescription,
        pastorDescription,
        pastorImageURL,
        gallery: churchGallery,
        videos: Array.isArray(videos) ? videos : [],
        mainImage: photoURL || pastorImageURL || "",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } catch (e) {
    console.error("Failed to ensure branch document:", e);
  }

  return authUser;
};

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if ("error" in authCheck) {
      return authCheck.error;
    }

    const body = await request.json();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    const displayName = String(body.displayName || "").trim();
    const branchLocation = String(body.branchLocation || "").trim();
    const branchAddress = String(body.branchAddress || "").trim();
    const branchDescription = String(body.branchDescription || "").trim();
    const pastorDescription = String(body.pastorDescription || "").trim();
    const pastorImageURL = String(body.pastorImageURL || "").trim();
    const videos = Array.isArray(body.videos)
      ? body.videos.map((v: string) => String(v).trim()).filter(Boolean)
      : String(body.videos || "")
          .split(/\n|,/) // allow newline or comma separated
          .map((item) => item.trim())
          .filter(Boolean);
    const churchGallery = Array.isArray(body.churchGallery)
      ? body.churchGallery.map((item: string) => String(item).trim()).filter(Boolean)
      : String(body.churchGallery || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
    const phoneNumber = String(body.phoneNumber || "").trim();
    const photoURL = String(body.photoURL || "").trim();

    if (!email || !password || !displayName || !branchLocation) {
      return NextResponse.json({ error: "Missing required team member fields." }, { status: 400 });
    }

    const authUser = await createTeamMember({
      email,
      password,
      displayName,
      photoURL,
      branchLocation,
      branchAddress,
      branchDescription,
      pastorDescription,
      pastorImageURL,
      churchGallery,
      videos,
      phoneNumber,
    });

    return NextResponse.json(
      {
        uid: authUser.uid,
        email,
        displayName,
        branchLocation,
        phoneNumber,
        photoURL: photoURL || "",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Team member create error:", error);
    return NextResponse.json({ error: "Failed to create team member." }, { status: 500 });
  }
}
