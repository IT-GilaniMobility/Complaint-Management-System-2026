import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    console.error("[ErrorReport]", JSON.stringify({
      digest: data?.digest,
      name: data?.name,
      message: data?.message,
      route: data?.route,
      userAgent: data?.userAgent,
      ts: data?.ts,
    }));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[ErrorReport] Failed to parse error report:", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
