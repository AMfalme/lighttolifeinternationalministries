import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/lib/firebase/admin";

type BranchDocumentData = {
  branchKey?: string;
  displayName?: string;
  branchLocation?: string;
  branchAddress?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorTitle?: string;
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

const normalize = (value: string) => toBranchKey(value || "");

const snapshotExists = (snapshot: { exists?: boolean | (() => boolean) }) =>
  typeof snapshot.exists === "function" ? snapshot.exists() : Boolean(snapshot.exists);

const pickNonEmptyGallery = (...candidates: Array<string[] | undefined>) =>
  candidates.find((candidate) => Array.isArray(candidate) && candidate.length) || [];

export async function GET(_request: NextRequest, context: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await context.params;
    const routeUid = String(uid || "").trim();

    if (!routeUid) {
      return NextResponse.json({ error: "Missing uid." }, { status: 400 });
    }

    const normalizedParams = normalize(routeUid);
    const branchCandidates = [routeUid, normalizedParams].filter(Boolean);

    let member: (TeamMemberDocumentData & { uid: string }) | null = null;
    let branchLocation = "";

    const userDoc = await adminDb().collection("users").doc(routeUid).get();
    if (snapshotExists(userDoc as { exists?: boolean | (() => boolean) })) {
      const data = userDoc.data() as TeamMemberDocumentData;
      member = { uid: userDoc.id, ...data };
      branchLocation = data.branchLocation || "";
    }

    if (!member) {
      const matchingUser = await adminDb().collection("users").where("branchKey", "==", routeUid).limit(1).get();
      if (!matchingUser.empty) {
        const docSnap = matchingUser.docs[0];
        const data = docSnap.data() as TeamMemberDocumentData;
        member = { uid: docSnap.id, ...data };
        branchLocation = data.branchLocation || "";
      }
    }

    if (!member) {
      const userSnap = await adminDb().collection("users").where("role", "==", "leadership").get();
      const found = userSnap.docs.find((document) => {
        const data = document.data() as TeamMemberDocumentData;
        const storedBranchKey = normalize(String(data.branchKey || ""));
        const storedBranchLocation = normalize(String(data.branchLocation || ""));
        return (
          document.id === routeUid ||
          storedBranchKey === normalizedParams ||
          storedBranchLocation === normalizedParams ||
          storedBranchLocation.includes(normalizedParams) ||
          normalizedParams.includes(storedBranchLocation)
        );
      });

      if (found) {
        const data = found.data() as TeamMemberDocumentData;
        member = { uid: found.id, ...data };
        branchLocation = data.branchLocation || "";
      }
    }

    let branchData: BranchDocumentData | null = null;

    if (member?.branchKey) {
      const byId = await adminDb().collection("branches").doc(String(member.branchKey)).get();
      if (snapshotExists(byId as { exists?: boolean | (() => boolean) })) {
        branchData = byId.data() as BranchDocumentData;
      }
    }

    if (!branchData) {
      for (const candidate of branchCandidates) {
        const byCandidate = await adminDb().collection("branches").doc(candidate).get();
        if (snapshotExists(byCandidate as { exists?: boolean | (() => boolean) })) {
          branchData = byCandidate.data() as BranchDocumentData;
          break;
        }
      }
    }

    if (!branchData) {
      const branchSnap = await adminDb().collection("branches").get();
      const matched = branchSnap.docs.find((document) => {
        const data = document.data() as BranchDocumentData;
        const docId = normalize(document.id);
        const dataBranchKey = normalize(String(data.branchKey || ""));
        const dataBranchLocation = normalize(String(data.branchLocation || ""));
        return (
          docId === normalizedParams ||
          dataBranchKey === normalizedParams ||
          dataBranchLocation === normalizedParams ||
          dataBranchLocation.includes(normalizedParams) ||
          normalizedParams.includes(dataBranchLocation)
        );
      });

      if (matched) {
        branchData = matched.data() as BranchDocumentData;
        if (!branchLocation) branchLocation = branchData.branchLocation || "";
      }
    }

    if (!member && branchData) {
      const usersSnap = await adminDb().collection("users").where("role", "==", "leadership").get();
      const matchedUser = usersSnap.docs.find((document) => {
        const data = document.data() as TeamMemberDocumentData;
        const dataBranchKey = normalize(String(data.branchKey || ""));
        const dataBranchLocation = normalize(String(data.branchLocation || ""));
        const branchKey = normalize(String(branchData?.branchKey || ""));
        const branchLoc = normalize(String(branchData?.branchLocation || ""));
        return (
          document.id === routeUid ||
          dataBranchKey === branchKey ||
          dataBranchKey === normalizedParams ||
          dataBranchLocation === branchLoc ||
          dataBranchLocation === normalizedParams ||
          dataBranchLocation.includes(normalizedParams) ||
          normalizedParams.includes(dataBranchLocation)
        );
      });

      if (matchedUser) {
        member = { uid: matchedUser.id, ...(matchedUser.data() as TeamMemberDocumentData) };
      }
    }

    if (!member && !branchData) {
      return NextResponse.json({ error: "Leadership not found." }, { status: 404 });
    }

    const resolvedChurchGallery = pickNonEmptyGallery(branchData?.churchGallery, member.churchGallery);
    const fallbackPastorGallery = pickNonEmptyGallery(branchData?.pastorGallery, member.pastorGallery);

    const mergedMember = member
      ? {
          uid: member.uid,
          branchKey: member.branchKey || branchData?.branchKey || normalizedParams || member.uid,
          displayName: member.displayName || branchData?.displayName || branchData?.branchLocation || "Branch Leader",
          pastorTitle: member.pastorTitle || branchData?.pastorTitle || "",
          branchLocation: branchData?.branchLocation || member.branchLocation || "Church Branch",
          branchAddress: branchData?.branchAddress || member.branchAddress || "",
          branchDescription:
            branchData?.branchDescription ||
            member.branchDescription ||
            "A vibrant church community with worship, teaching, and ministry designed to serve every family.",
          pastorDescription: branchData?.pastorDescription || member.pastorDescription || "",
          pastorImageURL: branchData?.pastorImageURL || member.pastorImageURL || "",
          pastorGallery:
            Array.isArray(branchData?.pastorGallery) && branchData.pastorGallery.length
              ? branchData.pastorGallery
              : Array.isArray(member.pastorGallery) && member.pastorGallery.length
              ? member.pastorGallery
              : Array.isArray(branchData?.pastorGallery)
              ? branchData.pastorGallery
              : [],
          churchGallery: resolvedChurchGallery.length ? resolvedChurchGallery : fallbackPastorGallery,
          phoneNumber: member.phoneNumber || "",
          email: member.email || "",
          videos: Array.isArray(branchData?.videos) ? branchData.videos : [],
        }
      : {
          uid: branchData?.branchKey || normalizedParams || routeUid,
          branchKey: branchData?.branchKey || normalizedParams || routeUid,
          displayName: branchData?.displayName || branchData?.branchLocation || "Branch Leader",
          pastorTitle: branchData?.pastorTitle || "",
          branchLocation: branchData?.branchLocation || "Church Branch",
          branchAddress: branchData?.branchAddress || "",
          branchDescription:
            branchData?.branchDescription ||
            "A vibrant church community with worship, teaching, and ministry designed to serve every family.",
          pastorDescription: branchData?.pastorDescription || "",
          pastorImageURL: branchData?.pastorImageURL || "",
          pastorGallery: Array.isArray(branchData?.pastorGallery) ? branchData?.pastorGallery : [],
          churchGallery: pickNonEmptyGallery(branchData?.churchGallery),
          phoneNumber: "",
          email: "",
          videos: Array.isArray(branchData?.videos) ? branchData?.videos : [],
        };

    const blogBranchName = mergedMember.branchLocation;
    const blogsSnap = await adminDb().collection("blogs").where("branch", "==", blogBranchName).get();

    return NextResponse.json({
      member: mergedMember,
      relatedBlogs: blogsSnap.docs.map((document) => ({ id: document.id, title: document.data().title })),
    });
  } catch (error) {
    console.error("Public leadership lookup failed:", error);
    return NextResponse.json({ error: "Failed to load leadership." }, { status: 500 });
  }
}
