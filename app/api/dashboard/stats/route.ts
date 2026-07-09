import { NextResponse } from "next/server";
import { adminDb } from "@/app/lib/firebase/admin";

export async function GET() {
  try {
    // Get total projects (missions)
    const projectsSnapshot = await adminDb().collection("projects").get();
    const totalProjects = projectsSnapshot.size;

    // Get total donations amount
    const donationsSnapshot = await adminDb().collection("donations").get();
    const totalDonations = donationsSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      return sum + (data.amount || 0);
    }, 0);

    // Get total event registrations (volunteers)
    const registrationsSnapshot = await adminDb().collection("eventRegistrations").get();
    const totalVolunteers = registrationsSnapshot.size;

    // Get total blogs (can represent students/educational content)
    const blogsSnapshot = await adminDb().collection("blogs").get();
    const totalBlogs = blogsSnapshot.size;

    return NextResponse.json({
      missions: totalProjects,
      donations: totalDonations,
      volunteers: totalVolunteers,
      students: totalBlogs,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}