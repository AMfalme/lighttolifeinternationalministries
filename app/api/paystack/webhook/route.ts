import { NextResponse } from "next/server";
import { getDonationByReference, updateDonationStatus } from "@/app/lib/firebase/firestore";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature." },
        { status: 401 }
      );
    }

    // Verify webhook signature using HMAC SHA512
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const hmac = require("crypto").createHmac("sha512", secretKey);
    const hash = hmac.update(body).digest("base64");

    if (hash !== signature) {
      return NextResponse.json(
        { error: "Invalid signature." },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle the event
    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const donation = await getDonationByReference(reference);

      if (donation && donation.status !== "success") {
        const amount = event.data.amount / 100; // Convert from kobo/cents
        const currency = event.data.currency;
        const channel = event.data.channel;
        const status = event.data.status;

        // Verify the payment amount matches the intended donation amount
        if (Math.abs(amount - donation.amount) < 0.01) {
          await updateDonationStatus(donation.id!, "success");
          console.log(`Donation ${reference} marked as successful. Amount: ${amount} ${currency}`);
        } else {
          console.error(`Amount mismatch for donation ${reference}. Expected ${donation.amount}, got ${amount}`);
        }
      }
    } else if (event.event === "charge.failed") {
      const reference = event.data.reference;
      const donation = await getDonationByReference(reference);

      if (donation && donation.status !== "failed") {
        await updateDonationStatus(donation.id!, "failed");
        console.log(`Donation ${reference} marked as failed.`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}