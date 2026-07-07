import { NextResponse } from "next/server";

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

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      { error: "Unable to verify payment at the moment." },
      { status: 500 }
    );
  }
}
