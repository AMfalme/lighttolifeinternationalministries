import { NextResponse } from "next/server";
import { adminDb } from "@/app/lib/firebase/admin";

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
    console.error("Public team members lookup failed:", error);
    return NextResponse.json({ error: "Failed to load team members." }, { status: 500 });
  }
}
