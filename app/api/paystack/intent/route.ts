import { NextResponse } from "next/server";
import { createDonation, getDonationByReference } from "@/app/lib/firebase/firestore";

interface IntentRequest {
  email: string;
  amount: number;
  currency: string;
  donorName?: string;
  phone?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const body: IntentRequest = await request.json();
    const { email, amount, currency, donorName, phone, message } = body;

    if (!email || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid donation details." },
        { status: 400 }
      );
    }

    // Generate a reference for tracking - must match what Paystack will use
    const reference = `DON-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`.toUpperCase();
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!publicKey || !secretKey) {
      return NextResponse.json(
        { error: "Paystack keys not configured." },
        { status: 500 }
      );
    }

    // Create pending donation in Firestore
    await createDonation({
      email,
      amount,
      currency,
      donorName: donorName || "",
      phone: phone || "",
      reference,
      channel: "pending",
      status: "pending",
      message: message || "",
    });

    // Initialize Paystack transaction
    const initializeResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack expects amount in cents
        currency,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donate/verify`,
      }),
    });

    const initializeData = await initializeResponse.json();

    if (!initializeResponse.ok || !initializeData.status) {
      // Clean up pending donation
      const existing = await getDonationByReference(reference);
      if (existing?.id) {
        // Mark as failed
        await updateDonationStatus(existing.id, "failed");
      }
      return NextResponse.json(
        { error: initializeData.message || "Failed to initialize payment." },
        { status: initializeResponse.status || 500 }
      );
    }

    return NextResponse.json({
      reference,
      authorization_url: initializeData.data.authorization_url,
      access_code: initializeData.data.access_code,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: "Unable to create payment intent." },
      { status: 500 }
    );
  }
}

// Helper function to update donation status
async function updateDonationStatus(id: string, status: string) {
  // This should be implemented in firestore.ts, but for now we'll use a placeholder
  // In a real implementation, you'd import updateDonationStatus from firestore
  console.error("updateDonationStatus not implemented");
}