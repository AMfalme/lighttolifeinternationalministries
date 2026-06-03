import { NextResponse } from "next/server";
import { adminDb } from "@/app/lib/firebase/admin";

type BranchDocumentData = {
  branchKey?: string;
  branchLocation?: string;
  branchAddress?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorTitle?: string;
  pastorImageURL?: string;
  pastorGallery?: string[];
  churchGallery?: string[];
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
  branchHistory?: string;
  pastorBiography?: string;
  churchStory?: string;
  vision?: string;
  futureDirection?: string;
  visionGoals?: string[];
  directors?: BranchFeatureItem[];
  projects?: BranchFeatureItem[];
  phoneNumber?: string;
  email?: string;
  role?: string;
};

const pickNonEmptyGallery = (...candidates: Array<string[] | undefined>) =>
  candidates.find((candidate) => Array.isArray(candidate) && candidate.length) || [];

const normalizeGalleryValue = (value: string[] | string | undefined | null) => {
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

const pickChurchGallery = (branchData?: BranchDocumentData) => branchData?.churchGallery || [];

const toLocationSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toBranchKey = (value: string) =>
  toLocationSlug(value)
    .replace(/-(branch|church|location|site|center|centre)$/g, "")
    .replace(/-(branch|church|location|site|center|centre)-/g, "-");

const getPriorityRank = (member: TeamMemberDocumentData) => {
  const branchKey = toBranchKey(String(member.branchKey || ""));
  const branchLocation = toBranchKey(String(member.branchLocation || ""));
  const displayName = String(member.displayName || "").toLowerCase();
  const isMosocho = branchKey.includes("mosocho") || branchLocation.includes("mosocho") || displayName.includes("bishop francis akaki");
  const isOmogwa = branchKey.includes("omogwa") || branchLocation.includes("omogwa");

  if (isMosocho) return 0;
  if (isOmogwa) return 1;
  if (branchKey || branchLocation) return 2;
  return 3;
};

export async function GET() {
  try {
    const usersSnap = await adminDb().collection("users").where("role", "==", "leadership").get();
    const members = usersSnap.docs.map((document) => ({
      uid: document.id,
      ...(document.data() as TeamMemberDocumentData),
    }));

    members.sort((left, right) => {
      const rankDelta = getPriorityRank(left) - getPriorityRank(right);
      if (rankDelta !== 0) {
        return rankDelta;
      }

      const leftName = String(left.displayName || "").toLowerCase();
      const rightName = String(right.displayName || "").toLowerCase();
      return leftName.localeCompare(rightName);
    });

    const branchKeys = Array.from(
      new Set(
        members
          .flatMap((member) => [member.branchKey, member.branchLocation])
          .map((value) => toBranchKey(String(value || "")))
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
      const branchKey = toBranchKey(String(member.branchKey || member.branchLocation || ""));
      const branchData = branchesByKey.get(branchKey);

      return {
        uid: member.uid,
        branchKey: member.branchKey || branchKey || member.uid,
        displayName: member.displayName || branchData?.branchLocation || "Branch Leader",
        pastorTitle: member.pastorTitle || branchData?.pastorTitle || "",
        branchLocation: member.branchLocation || branchData?.branchLocation || "Church Branch",
        branchAddress: member.branchAddress || branchData?.branchAddress || "",
        branchDescription:
          member.branchDescription ||
          branchData?.branchDescription ||
          "A vibrant church community with worship, teaching, and ministry designed to serve every family.",
        pastorDescription: member.pastorDescription || branchData?.pastorDescription || "",
        pastorImageURL: member.pastorImageURL || branchData?.pastorImageURL || "",
        pastorGallery: pickNonEmptyGallery(branchData?.pastorGallery, normalizeGalleryValue(member.pastorGallery)),
        churchGallery: pickNonEmptyGallery(pickChurchGallery(branchData), normalizeGalleryValue(member.churchGallery)),
        branchHistory: member.branchHistory || branchData?.branchHistory || "",
        pastorBiography: member.pastorBiography || branchData?.pastorBiography || "",
        churchStory: member.churchStory || branchData?.churchStory || "",
        vision: member.vision || branchData?.vision || "",
        futureDirection: member.futureDirection || branchData?.futureDirection || "",
        visionGoals: normalizeTextList(branchData?.visionGoals || member.visionGoals),
        directors: normalizeFeatureItems(branchData?.directors || member.directors),
        projects: normalizeFeatureItems(branchData?.projects || member.projects),
        phoneNumber: member.phoneNumber || "",
        email: member.email || "",
      };
    });

    return NextResponse.json({
      members: mergedMembers.slice(0, 3),
    });
  } catch (error) {
    console.error("Public team list lookup failed:", error);
    return NextResponse.json({ error: "Failed to load leadership." }, { status: 500 });
  }
}