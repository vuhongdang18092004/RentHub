import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, content } = body;

    const bankAccount = process.env.BANK_ACCOUNT || "1234567890";
    const bankCode = (process.env.BANK_CODE || "VCB").toLowerCase();
    const bankOwner = process.env.BANK_OWNER || "CONG TY CP RENTHUB";

    // Construct the public, free, and robust img.vietqr.io Quick Link URL
    const qrDataURL = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(bankOwner)}`;

    return NextResponse.json({
      qrDataURL,
      bankInfo: {
        bankAccount,
        bankOwner,
        bankCode: bankCode.toUpperCase(),
      },
    });
  } catch (error: any) {
    console.error("Error in VietQR API Proxy:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
