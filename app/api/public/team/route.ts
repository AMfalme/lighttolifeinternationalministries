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
  gallery?: string[];
  mainImage?: string;
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
  photoURL?: string;
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

export async function GET() {
  try {
    const usersSnap = await adminDb().collection("users").where("role", "==", "leadership").get();
    const members = usersSnap.docs.map((document) => ({
      uid: document.id,
      ...(document.data() as TeamMemberDocumentData),
    }));

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
        pastorGallery: Array.isArray(member.pastorGallery) && member.pastorGallery.length ? member.pastorGallery : Array.isArray(branchData?.pastorGallery) ? branchData.pastorGallery : [],
        churchGallery: Array.isArray(member.churchGallery) && member.churchGallery.length ? member.churchGallery : Array.isArray(branchData?.gallery) ? branchData.gallery : [],
        phoneNumber: member.phoneNumber || "",
        email: member.email || "",
        photoURL: member.photoURL || branchData?.mainImage || "",
      };
    });

    return NextResponse.json({
      members: mergedMembers,
    });
  } catch (error) {
    console.error("Public team list lookup failed:", error);
    return NextResponse.json({ error: "Failed to load leadership." }, { status: 500 });
  }
}