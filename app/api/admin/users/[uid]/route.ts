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

export async function PATCH(request: NextRequest, context: { params: Promise<{ uid: string }> }) {
  try {
    const authCheck = await requireAdmin(request);
    if ("error" in authCheck) {
      return authCheck.error;
    }
    const { uid } = await context.params;
    const body = await request.json();
    const displayName = String(body.displayName || "").trim();
    const branchLocation = String(body.branchLocation || "").trim();
    const phoneNumber = String(body.phoneNumber || "").trim();
    const role = String(body.role || "user").trim();

    if (!displayName || !role) {
      return NextResponse.json({ error: "Missing required user fields." }, { status: 400 });
    }

    // Make Auth updates best-effort so Firestore update persists even if Auth fails
    try {
      await adminAuth().updateUser(uid, {
        displayName,
      });
    } catch (authErr) {
      console.warn("adminAuth.updateUser failed (continuing):", authErr);
    }

    try {
      await adminAuth().setCustomUserClaims(uid, { role });
    } catch (claimErr) {
      console.warn("adminAuth.setCustomUserClaims failed (continuing):", claimErr);
    }

    await adminDb().collection("users").doc(uid).set(
      {
        displayName,
        branchLocation,
        phoneNumber,
        role,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ uid, displayName, branchLocation, phoneNumber, role });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}