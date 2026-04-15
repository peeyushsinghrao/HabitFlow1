import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/db';
import { normalizeEmail, userIdFromEmail } from '@/lib/auth-user';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    console.log('[forgot-password] Request for:', email);

    const userId = userIdFromEmail(email);
    const existing = await db.userProfile.findUnique({ where: { userId } });

    if (!existing) {
      return NextResponse.json(
        { error: 'No account found with this email. Please sign up first.' },
        { status: 404 }
      );
    }

    const appDomain = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'https://yourapp.com';

    const resetLink = `${appDomain}/?resetEmail=${encodeURIComponent(email)}`;

    try {
      const { error: sendError } = await resend.emails.send({
        from: 'Nuviora <onboarding@resend.dev>',
        to: email,
        subject: 'Reset Your Password 🔐',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">
    <div style="background:linear-gradient(135deg,#C08552,#8C5A3C);border-radius:16px;padding:32px;text-align:center;margin-bottom:28px">
      <h1 style="margin:0;color:#FFF8F0;font-size:26px;font-weight:700">🔐 Nuviora</h1>
      <p style="margin:8px 0 0;color:#FFE0B2;font-size:14px">Password Reset Request</p>
    </div>
    <div style="background:white;border-radius:12px;padding:28px;box-shadow:0 2px 8px rgba(192,133,82,0.12);margin-bottom:20px">
      <p style="color:#4B2E2B;font-size:15px;margin:0 0 16px">Hello,</p>
      <p style="color:#4B2E2B;font-size:15px;margin:0 0 24px;line-height:1.6">
        We received a request to reset your password for <strong>${email}</strong>.
        Click the button below to set a new password.
      </p>
      <div style="text-align:center;margin:24px 0">
        <a href="${resetLink}"
           style="display:inline-block;background:linear-gradient(135deg,#C08552,#8C5A3C);color:white;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.3px">
          Reset My Password →
        </a>
      </div>
      <p style="color:#8C5A3C;font-size:12px;margin:20px 0 0;text-align:center;line-height:1.6">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#A08070;margin:0">
      Sent by Nuviora • Your personal habit tracker
    </p>
  </div>
</body>
</html>`,
      });
      if (sendError) {
        console.warn('[forgot-password] Email not sent (likely domain not verified):', sendError.message);
      } else {
        console.log('[forgot-password] Email sent successfully to:', email);
      }
    } catch (emailErr) {
      console.warn('[forgot-password] Email send failed silently:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[forgot-password] Error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
