import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/lib/firebase/admin";
import { serverTimestamp } from "firebase-admin/firestore";

const requireAdmin = async (request: NextRequest) => {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };
  }

  const decoded = await adminAuth().verifyIdToken(token);
  const userDoc = await adminDb().collection("users").doc(decoded.uid).get();
  const role = userDoc.data()?.role;

  if (role !== "admin") {
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
    const phoneNumber = String(body.phoneNumber || "").trim();
    const photoURL = String(body.photoURL || "").trim();

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
        branchLocation,
        phoneNumber,
        photoURL: photoURL || "",
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

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
