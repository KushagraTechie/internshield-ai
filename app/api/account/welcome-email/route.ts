import { NextResponse } from "next/server";
import { authenticateFirebaseRequest } from "@/lib/firebase-server-auth";
import { claimWelcomeEmail, markWelcomeEmailSent, releaseWelcomeEmailClaim } from "@/lib/db";
import { reportEmailFailureMessage, sendWelcomeEmail } from "@/lib/email-report";

export async function POST(request: Request) {
  const authentication = await authenticateFirebaseRequest(request);
  if (!authentication.ok) {
    return NextResponse.json({ success: false, message: authentication.message }, { status: authentication.status });
  }
  if (!authentication.user.emailVerified || !authentication.user.email) {
    return NextResponse.json({ success: false, message: "Confirm your email before requesting the welcome message." }, { status: 403 });
  }

  let claimed = false;
  try {
    claimed = await claimWelcomeEmail(authentication.user);
    if (!claimed) return NextResponse.json({ success: true, alreadySent: true, message: "Your account is ready." });

    await sendWelcomeEmail(authentication.user.email, authentication.user.displayName, authentication.user.uid);
    await markWelcomeEmailSent(authentication.user.uid);
    return NextResponse.json({ success: true, sent: true, message: "Welcome email sent to your confirmed address." });
  } catch (error) {
    if (claimed) {
      try { await releaseWelcomeEmailClaim(authentication.user.uid); } catch (releaseError) {
        console.error("Could not release welcome-email retry lock:", releaseError);
      }
    }
    console.error("Welcome email delivery failed:", error);
    return NextResponse.json({
      success: false,
      code: error instanceof Error ? error.message.split(":")[0] : "WELCOME_EMAIL_FAILED",
      message: reportEmailFailureMessage(error),
    }, { status: 503 });
  }
}
