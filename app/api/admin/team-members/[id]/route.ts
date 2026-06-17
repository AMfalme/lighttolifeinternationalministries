import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

type TeamMemberDocument = {
  name?: string;
  title?: string;
  role?: string;
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authCheck = await requireAdmin(request);
    if ("error" in authCheck) {
      return authCheck.error;
    }

    const { id } = await params;
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

    if (!name || !title || !role) {
      return NextResponse.json({ error: "Missing required team member fields." }, { status: 400 });
    }

    await adminDb().collection("teamMembers").doc(id).set(
      {
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
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Team member update error:", error);
    return NextResponse.json({ error: "Failed to update team member." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authCheck = await requireAdmin(request);
    if ("error" in authCheck) {
      return authCheck.error;
    }

    const { id } = await params;
    await adminDb().collection("teamMembers").doc(id).delete();

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Team member delete error:", error);
    return NextResponse.json({ error: "Failed to delete team member." }, { status: 500 });
  }
}
