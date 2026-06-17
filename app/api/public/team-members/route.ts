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
  displayOrder?: string | number;
};

export async function GET() {
  try {
    const snapshot = await adminDb().collection("teamMembers").get();
    const members = snapshot.docs.map((document) => {
      const data = document.data() as TeamMemberDocument;
      return {
        id: document.id,
        ...data,
        displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : 999,
      };
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Public team members lookup failed:", error);
    return NextResponse.json({ error: "Failed to load team members." }, { status: 500 });
  }
}
