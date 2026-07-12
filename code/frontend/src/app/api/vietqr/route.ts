import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, content, bankAccount: reqBankAccount, bankCode: reqBankCode, userBankName: reqBankOwner } = body;

    // Use dynamic request parameters (from database owner info) with SePay VA as default fallback
    const bankAccount = reqBankAccount || "VQRQAKHZL5756";
    const bankCode = (reqBankCode || "mb").toLowerCase();
    const bankOwner = reqBankOwner || "BUI TRUNG DUC";

    if (!bankAccount || !bankCode) {
      return NextResponse.json(
        { error: "Thiếu thông tin tài khoản ngân hàng người nhận" },
        { status: 400 }
      );
    }

    // Construct the public, free, and robust qr.sepay.vn Quick Link URL
    let formattedBankCode = bankCode.toUpperCase();
    if (formattedBankCode === "MB") {
      formattedBankCode = "MBBank";
    }
    const qrDataURL = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${formattedBankCode}&amount=${amount}&des=${encodeURIComponent(content)}`;

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
