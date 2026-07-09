import { NextResponse } from "next/server";
import { getDonationByReference, updateDonationStatus } from "@/app/lib/firebase/firestore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!reference) {
    return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });
  }

  if (!secretKey) {
    return NextResponse.json(
      { error: "Paystack secret key is not configured." },
      { status: 500 }
    );
  }

  try {
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const payload = await verifyResponse.json();

    if (!verifyResponse.ok || payload.status !== true) {
      return NextResponse.json(
        { error: payload.message || "Payment verification failed." },
        { status: verifyResponse.status || 400 }
      );
    }

    // Verify payment amount matches the intended donation amount
    const donation = await getDonationByReference(reference);
    if (donation && donation.id) {
      const paidAmount = payload.data.amount / 100; // Convert from kobo/cents
      const intendedAmount = donation.amount;

      // Check if amount matches (allow small floating point differences)
      if (Math.abs(paidAmount - intendedAmount) >= 0.01) {
        console.error(`Amount mismatch for ${reference}: expected ${intendedAmount}, got ${paidAmount}`);
        // Still return success to Paystack, but log the discrepancy
        // The webhook will handle updating the status
      } else if (donation.status !== "success") {
        // Update donation status to success
        await updateDonationStatus(donation.id, "success");
      }
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      { error: "Unable to verify payment at the moment." },
      { status: 500 }
    );
  }
}
