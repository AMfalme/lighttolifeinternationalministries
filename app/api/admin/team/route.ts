import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const makeBranchKey = (value: string) =>
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

type BranchDocumentData = {
  branchKey?: string;
  displayName?: string;
  pastorTitle?: string;
  branchLocation?: string;
  branchAddress?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  pastorGallery?: string[];
  churchGallery?: string[];
  videos?: string[];
};

type TeamMemberDocumentData = {
  displayName?: string;
  pastorTitle?: string;
  branchKey?: string;
  branchLocation?: string;
  branchAddress?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  pastorGallery?: string[];
  churchGallery?: string[];
  phoneNumber?: string;
  email?: string;
  role?: string;
};

const pickNonEmptyGallery = (...candidates: Array<string[] | undefined>) =>
  candidates.find((candidate) => Array.isArray(candidate) && candidate.length) || [];

const normalizeGalleryValue = (
  value:
    | string[]
    | Array<string | { url?: string }>
    | string
    | undefined
    | null,
) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }
        if (item && typeof item === "object" && typeof item.url === "string") {
          return item.url.trim();
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const pickBranchGallery = (branchData?: BranchDocumentData | null) => branchData?.churchGallery || [];

const normalize = (value: string) => makeBranchKey(value || "");

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if ("error" in authCheck) {
      return authCheck.error;
    }

    const usersSnap = await adminDb().collection("users").where("role", "==", "leadership").get();
    const members = usersSnap.docs.map((document) => ({
      uid: document.id,
      ...(document.data() as TeamMemberDocumentData),
    }));

    const branchKeys = Array.from(
      new Set(
        members
          .flatMap((member) => [member.branchKey, member.branchLocation])
          .map((value) => normalize(String(value || "")))
          .filter(Boolean),
      ),
    );

    const branchSnapshots = await Promise.all(branchKeys.map((key) => adminDb().collection("branches").doc(key).get()));
    const branchesByKey = new Map<string, BranchDocumentData>();

    branchSnapshots.forEach((snapshot, index) => {
      if (snapshot.exists) {
        branchesByKey.set(branchKeys[index], snapshot.data() as BranchDocumentData);
      }
    });

    const mergedMembers = members.map((member) => {
      const branchKey = normalize(String(member.branchKey || member.branchLocation || ""));
      const branchData = branchesByKey.get(branchKey);
      const primaryImage = member.pastorImageURL || branchData?.pastorImageURL || "";

      return {
        uid: member.uid,
        branchKey: member.branchKey || branchKey || member.uid,
        displayName: member.displayName || branchData?.displayName || branchData?.branchLocation || "Branch Leader",
        pastorTitle: member.pastorTitle || branchData?.pastorTitle || "",
        branchLocation: member.branchLocation || branchData?.branchLocation || "Church Branch",
        branchAddress: member.branchAddress || branchData?.branchAddress || "",
        branchDescription:
          member.branchDescription ||
          branchData?.branchDescription ||
          "A vibrant church community with worship, teaching, and ministry designed to serve every family.",
        pastorDescription: member.pastorDescription || branchData?.pastorDescription || "",
        pastorImageURL: primaryImage,
        pastorGallery: pickNonEmptyGallery(branchData?.pastorGallery, normalizeGalleryValue(member.pastorGallery)),
        churchGallery: pickNonEmptyGallery(pickBranchGallery(branchData), normalizeGalleryValue(member.churchGallery)),
        videos: Array.isArray(branchData?.videos) ? branchData.videos : [],
        phoneNumber: member.phoneNumber || "",
        email: member.email || "",
      };
    });

    return NextResponse.json({ members: mergedMembers });
  } catch (error) {
    console.error("Admin leadership list lookup failed:", error);
    return NextResponse.json({ error: "Failed to load leadership." }, { status: 500 });
  }
}

const createTeamMember = async ({
  existingUid,
  email,
  password,
  displayName,
  pastorTitle,
  branchLocation,
  branchAddress,
  branchDescription,
  pastorDescription,
  pastorImageURL,
  pastorGallery,
  churchGallery,
  videos,
  phoneNumber,
}: {
  existingUid?: string;
  email: string;
  password?: string;
  displayName: string;
  pastorTitle: string;
  branchLocation: string;
  branchAddress: string;
  branchDescription: string;
  pastorDescription: string;
  pastorImageURL: string;
  pastorGallery: string[];
  churchGallery: string[];
  videos: string[];
  phoneNumber: string;
}) => {
  const authUser = existingUid
    ? await adminAuth().updateUser(existingUid, {
        email,
        displayName,
        photoURL: pastorImageURL || undefined,
      }).then(() => adminAuth().getUser(existingUid))
    : await adminAuth().createUser({
        email,
        password: password || "",
        displayName,
        photoURL: pastorImageURL || undefined,
      });

  const branchKey = makeBranchKey(branchLocation || authUser.uid);

  await adminAuth().setCustomUserClaims(authUser.uid, { role: "leadership" });

  await adminDb().collection("users").doc(authUser.uid).set({
    uid: authUser.uid,
    email,
    displayName,
    pastorTitle,
    branchLocation,
    branchKey,
    branchAddress,
    branchDescription,
    pastorDescription,
    pastorImageURL,
    pastorGallery,
    churchGallery,
    videos: Array.isArray(videos) ? videos : [],
    phoneNumber,
    role: "leadership",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Ensure a branches document exists for this branchLocation to store branch-specific media and metadata
  try {
    console.log("Creating/updating branch doc", { branchKey, churchGalleryLength: Array.isArray(churchGallery) ? churchGallery.length : 0 });
    const branchPayload: BranchDocumentData & { updatedAt: any } = {
      branchKey,
      displayName,
      pastorTitle,
      branchLocation,
      branchAddress,
      branchDescription,
      pastorDescription,
      pastorImageURL,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (Array.isArray(pastorGallery) && pastorGallery.length) branchPayload.pastorGallery = pastorGallery;
    if (Array.isArray(churchGallery) && churchGallery.length) branchPayload.churchGallery = churchGallery;
    if (Array.isArray(videos) && videos.length) branchPayload.videos = videos;

    await adminDb().collection("branches").doc(branchKey).set(branchPayload, { merge: true });
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
    console.log("body received in POST /api/admin/team:", body);
    const existingUid = String(body.existingUid || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    const displayName = String(body.displayName || "").trim();
    const pastorTitle = String(body.pastorTitle || "").trim();
    const branchLocation = String(body.branchLocation || "").trim();
    const branchAddress = String(body.branchAddress || "").trim();
    const branchDescription = String(body.branchDescription || "").trim();
    const pastorDescription = String(body.pastorDescription || "").trim();
    const pastorImageURL = String(body.pastorImageURL || "").trim();
    const pastorGallery = normalizeGalleryValue(body.pastorGallery);
    const churchGallery = normalizeGalleryValue(body.churchGallery);
    const videos = Array.isArray(body.videos)
      ? body.videos.map((v: string) => String(v).trim()).filter(Boolean)
      : String(body.videos || "")
          .split(/\n|,/) // allow newline or comma separated
          .map((item) => item.trim())
          .filter(Boolean);
    const phoneNumber = String(body.phoneNumber || "").trim();

    if (!displayName || !branchLocation) {
      return NextResponse.json({ error: "Missing required leadership fields." }, { status: 400 });
    }

    let resolvedUid = existingUid;
    if (!resolvedUid && email) {
      try {
        const existingUser = await adminAuth().getUserByEmail(email);
        resolvedUid = existingUser.uid;
      } catch (error) {
        const isNotFoundError =
          error instanceof Error
            ? /user-not-found/.test(error.message)
            : typeof error === "object" && error !== null && "code" in error && (error as any).code === "auth/user-not-found";
        if (!isNotFoundError) {
          throw error;
        }
      }
    }

    if (!resolvedUid && !email) {
      return NextResponse.json({ error: "Email is required to create a new leadership account." }, { status: 400 });
    }

    if (!resolvedUid && !password) {
      return NextResponse.json({ error: "Password is required to create a new leadership account." }, { status: 400 });
    }

    if (!resolvedUid && password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    // Debug: log incoming churchGallery and branchLocation to help trace missing writes
    try {
      console.log("Admin POST incoming churchGallery:", { branchLocation, churchGallery });
    } catch (e) {
      /* ignore logging errors */
    }

    const authUser = await createTeamMember({
      email,
      password: resolvedUid ? undefined : password,
      displayName,
      pastorTitle,
      branchLocation,
      branchAddress,
      branchDescription,
      pastorDescription,
      pastorImageURL,
      pastorGallery,
      churchGallery,
      videos,
      phoneNumber,
      existingUid: resolvedUid || undefined,
    });

    return NextResponse.json(
      {
        uid: authUser.uid,
        email,
        displayName,
        pastorTitle,
        branchLocation,
        phoneNumber,
        pastorGallery,
        pastorImageURL: pastorImageURL || "",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Leadership create error:", error);
    const message = error instanceof Error ? error.message : "Failed to create leadership.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
