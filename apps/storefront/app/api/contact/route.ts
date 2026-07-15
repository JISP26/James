import { NextRequest, NextResponse } from "next/server";

// MVP contact endpoint: validates input and returns success.
// TODO (post-MVP): persist to a `contact_messages` table or forward to an
// email/notification service (e.g. Resend, Postmark) using a server-only key.
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  // eslint-disable-next-line no-console
  console.log("[JISP contact form]", { name, email, message });

  return NextResponse.json({ ok: true });
}
