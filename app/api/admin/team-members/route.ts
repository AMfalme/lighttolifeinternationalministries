import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

type TeamMemberDocument = {
  name: string;
  title: string;
  role: string;
  imageURL?: string;
  background?: string;
  gallery?: string[];
  branchLocation?: string;
  phoneNumber?: string;
  email?: string;
  branchKey?: string;
};

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

export async function GET() {
  try {
    const snapshot = await adminDb().collection("teamMembers").get();
    const members = snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as TeamMemberDocument),
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Team members list lookup failed:", error);
    return NextResponse.json({ error: "Failed to load team members." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if ("error" in authCheck) {
      return authCheck.error;
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const title = String(body.title || "").trim();
    const role = String(body.role || "").trim();
    const imageURL = String(body.imageURL || "").trim();
    const background = String(body.background || "").trim();
    const branchLocation = String(body.branchLocation || "").trim();
    const phoneNumber = String(body.phoneNumber || "").trim();
    const email = String(body.email || "").trim();
    const gallery = Array.isArray(body.gallery)
      ? body.gallery.map((item: string) => String(item).trim()).filter(Boolean)
      : String(body.gallery || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
    const branchKey = toBranchKey(branchLocation || name);
    const displayOrder = body.displayOrder === "" ? 999 : Number(body.displayOrder);

    if (!name || !title || !role) {
      return NextResponse.json({ error: "Missing required team member fields." }, { status: 400 });
    }

    const docRef = adminDb().collection("teamMembers").doc();
    await docRef.set({
      name,
      title,
      role,
      imageURL,
      background,
      gallery,
      branchLocation,
      branchKey,
      phoneNumber,
      email,
      displayOrder,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Team member create error:", error);
    return NextResponse.json({ error: "Failed to create team member." }, { status: 500 });
  }
}
