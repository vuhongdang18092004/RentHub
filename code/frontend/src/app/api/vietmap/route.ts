import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  
  const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY || "7a45350d010dc9414c4a0149d8eb129b6adb5601c6eb6c4e";

  try {
    if (action === "autocomplete") {
      const text = searchParams.get("text") || "";
      const url = `https://maps.vietmap.vn/api/autocomplete/v3?apikey=${apiKey}&text=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch from VietMap Autocomplete" }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json(data);
    } 
    
    if (action === "place") {
      const refid = searchParams.get("refid") || "";
      const url = `https://maps.vietmap.vn/api/place/v3?apikey=${apiKey}&refid=${refid}`;
      const res = await fetch(url);
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch from VietMap Place Detail" }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in VietMap API Proxy:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
