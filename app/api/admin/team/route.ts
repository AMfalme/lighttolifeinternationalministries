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
    const phoneNumber = String(body.phoneNumber || "").trim();
    const photoURL = String(body.photoURL || "").trim();

    if (!email || !password || !displayName || !branchLocation) {
      return NextResponse.json({ error: "Missing required team member fields." }, { status: 400 });
    }

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
      phoneNumber,
      photoURL: photoURL || "",
      role: "team-member",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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
