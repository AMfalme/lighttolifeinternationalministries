import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

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
  branchHistory?: string;
  pastorBiography?: string;
  churchStory?: string;
  vision?: string;
  futureDirection?: string;
  visionGoals?: string[];
  directors?: BranchFeatureItem[];
  projects?: BranchFeatureItem[];
};

type BranchFeatureItem = {
  id?: string;
  imageURL?: string;
  name?: string;
  role?: string;
  description?: string;
};

const toBranchKey = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-(branch|church|location|site|center|centre)$/g, "")
    .replace(/-(branch|church|location|site|center|centre)-/g, "-");

const normalizeGalleryValue = (
  value:
    | string[]
    | Array<string | { url?: string }>
    | string
    | undefined
    | null
) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        // plain string
        if (typeof item === "string") {
          return item.trim();
        }

        // object with url property
        if (
          item &&
          typeof item === "object" &&
          typeof item.url === "string"
        ) {
          return item.url.trim();
        }

        return "";
      })
      .filter(
        (item) =>
          typeof item === "string" &&
          item.trim() !== "" &&
          item !== "undefined" &&
          item !== "null"
      );
  }

  if (typeof value === "string") {
    return value
      .split(/,|\n/)
      .map((item) => item.trim())
      .filter(
        (item) =>
          item !== "" &&
          item !== "undefined" &&
          item !== "null"
      );
  }

  return [];
};

const normalizeTextList = (value: string[] | string | undefined | null) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeFeatureItems = (
  value: Array<BranchFeatureItem | string> | string | undefined | null,
) => {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === "string") {
          const trimmed = item.trim();
          if (!trimmed) return null;

          return {
            id: `item-${index}-${trimmed}`,
            imageURL: "",
            name: trimmed,
            role: "",
            description: "",
          } satisfies BranchFeatureItem;
        }

        if (!item || typeof item !== "object") {
          return null;
        }

        const imageURL = typeof item.imageURL === "string" ? item.imageURL.trim() : "";
        const name = typeof item.name === "string" ? item.name.trim() : "";
        const role = typeof item.role === "string" ? item.role.trim() : "";
        const description = typeof item.description === "string" ? item.description.trim() : "";

        if (!imageURL && !name && !role && !description) {
          return null;
        }

        return {
          id: item.id || `item-${index}`,
          imageURL,
          name,
          role,
          description,
        } satisfies BranchFeatureItem;
      })
      .filter(Boolean) as BranchFeatureItem[];
  }

  if (typeof value === "string") {
    return normalizeTextList(value).map((item, index) => ({
      id: `item-${index}-${item}`,
      imageURL: "",
      name: item,
      role: "",
      description: "",
    })) as BranchFeatureItem[];
  }

  return [];
};

const requireAdmin = async (request: NextRequest) => {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : "";

  if (!token) {
    return {
      error: NextResponse.json(
        { error: "Missing authorization token." },
        { status: 401 }
      ),
    };
  }

  const decoded = await adminAuth().verifyIdToken(token);

  const hasAdminClaim =
    decoded.role === "admin" ||
    decoded.role === "super-admin";

  const hasLeadershipClaim =
    decoded.role === "leadership";

  if (hasAdminClaim || hasLeadershipClaim) {
    return { uid: decoded.uid };
  }

  const userDoc = await adminDb()
    .collection("users")
    .doc(decoded.uid)
    .get();

  const role = userDoc.data()?.role;

  if (
    role !== "admin" &&
    role !== "super-admin" &&
    role !== "leadership"
  ) {
    return {
      error: NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { uid: decoded.uid };
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const authCheck = await requireAdmin(request);

    if ("error" in authCheck) {
      return authCheck.error;
    }

    const { uid } = await params;

    const body = await request.json();
    const targetUid = String(body.existingUid || uid).trim() || uid;

    console.log("RAW REQUEST BODY:", body);

    const displayName = String(
      body.displayName || ""
    ).trim();

    const pastorTitle = String(
      body.pastorTitle || ""
    ).trim();

    const email = String(
      body.email || ""
    ).trim();

    const branchLocation = String(
      body.branchLocation || ""
    ).trim();

    const branchAddress = String(
      body.branchAddress || ""
    ).trim();

    const branchDescription = String(
      body.branchDescription || ""
    ).trim();

    const pastorDescription = String(
      body.pastorDescription || ""
    ).trim();

    const branchHistory = String(body.branchHistory || "").trim();
    const pastorBiography = String(body.pastorBiography || "").trim();
    const churchStory = String(body.churchStory || "").trim();
    const vision = String(body.vision || "").trim();
    const futureDirection = String(body.futureDirection || "").trim();
    const visionGoals = normalizeTextList(body.visionGoals);
    const directors = normalizeFeatureItems(body.directors);
    const projects = normalizeFeatureItems(body.projects);

    const pastorImageURL = String(
      body.pastorImageURL || ""
    ).trim();

    const pastorGallery = normalizeGalleryValue(
      body.pastorGallery
    );

    const churchGallery = normalizeGalleryValue(
      body.churchGallery
    );

    const videos = Array.isArray(body.videos)
      ? body.videos
          .map((v: string) => String(v).trim())
          .filter(Boolean)
      : String(body.videos || "")
          .split(/\n|,/)
          .map((item) => item.trim())
          .filter(Boolean);

    const phoneNumber = String(
      body.phoneNumber || ""
    ).trim();

    const branchKey = toBranchKey(
      branchLocation || targetUid
    );

    console.log("NORMALIZED DATA:", {
      uid: targetUid,
      branchLocation,
      branchKey,
      pastorGallery,
      churchGallery,
      videos,
      directors,
      projects,
    });

    if (!displayName || !email || !branchLocation) {
      return NextResponse.json(
        { error: "Missing required leadership fields." },
        { status: 400 }
      );
    }

    let authUpdateWarning = "";

    try {
      await adminAuth().updateUser(targetUid, {
        displayName,
        email,
        photoURL: pastorImageURL || undefined,
      });
      await adminAuth().setCustomUserClaims(targetUid, { role: "leadership" });
    } catch (authError) {
      authUpdateWarning =
        authError instanceof Error
          ? authError.message
          : "Unable to sync Firebase Auth user.";

      console.warn(
        "Leadership auth update warning:",
        authUpdateWarning
      );
    }

    await adminDb()
      .collection("users")
      .doc(targetUid)
      .set(
        {
          displayName,
          pastorTitle,
          email,
          role: "leadership",
          branchLocation,
          branchKey,
          branchAddress,
          branchDescription,
          pastorDescription,
          pastorImageURL,
          pastorGallery,
          churchGallery,
          videos,
          branchHistory,
          pastorBiography,
          churchStory,
          vision,
          futureDirection,
          visionGoals,
          directors,
          projects,
          phoneNumber,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    try {
      const branchPayload: BranchDocumentData & {
        updatedAt: FirebaseFirestore.FieldValue;
      } = {
        branchKey,
        displayName,
        pastorTitle,
        branchLocation,
        branchAddress,
        branchDescription,
        pastorDescription,
        pastorImageURL,
        branchHistory,
        pastorBiography,
        churchStory,
        vision,
        futureDirection,
        visionGoals,
        directors,
        projects,
        pastorGallery,
        churchGallery,
        videos,
        updatedAt: FieldValue.serverTimestamp(),
      };

      console.log(
        "FINAL BRANCH PAYLOAD:",
        JSON.stringify(branchPayload, null, 2)
      );

      await adminDb()
        .collection("branches")
        .doc(branchKey)
        .set(branchPayload, { merge: true });

      console.log(
        "PATCH branch doc write successful",
        { branchKey }
      );
    } catch (e) {
      console.error(
        "Failed to update branch document:",
        e
      );
    }

    return NextResponse.json({
      uid: targetUid,
      displayName,
      pastorTitle,
      email,
      branchLocation,
      phoneNumber,
      pastorImageURL: pastorImageURL || "",
      pastorGallery,
      churchGallery,
      videos,
      branchHistory,
      pastorBiography,
      churchStory,
      vision,
      futureDirection,
      visionGoals,
      directors,
      projects,
      warning: authUpdateWarning || undefined,
    });
  } catch (error) {
    console.error("Leadership update error:", error);

    return NextResponse.json(
      { error: "Failed to update leadership." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const authCheck = await requireAdmin(request);

    if ("error" in authCheck) {
      return authCheck.error;
    }

    const { uid } = await params;

    await adminAuth().deleteUser(uid);

    await adminDb()
      .collection("users")
      .doc(uid)
      .delete();

    return NextResponse.json({ uid });
  } catch (error) {
    console.error("Leadership delete error:", error);

    return NextResponse.json(
      { error: "Failed to delete leadership." },
      { status: 500 }
    );
  }
}