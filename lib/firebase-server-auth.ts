export type FirebaseUser = {
  uid: string;
  email?: string;
  displayName?: string;
  emailVerified: boolean;
};

export type FirebaseAuthResult =
  | { ok: true; user: FirebaseUser }
  | { ok: false; status: 401 | 503; message: string };

export async function authenticateFirebaseRequest(
  request: Request
): Promise<FirebaseAuthResult> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      message: "Firebase server verification is not configured.",
    };
  }

  const authorization = request.headers.get("authorization");
  const idToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  if (!idToken) {
    return { ok: false, status: 401, message: "Sign in to continue." };
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) {
      return {
        ok: false,
        status: 401,
        message: "Your session is invalid. Please sign in again.",
      };
    }

    const identity = (await response.json()) as {
      users?: Array<{ localId?: string; email?: string; displayName?: string; emailVerified?: boolean }>;
    };
    const firebaseUser = identity.users?.[0];
    if (!firebaseUser?.localId) {
      return {
        ok: false,
        status: 401,
        message: "Your session is invalid. Please sign in again.",
      };
    }

    return {
      ok: true,
      user: {
        uid: firebaseUser.localId,
        emailVerified: firebaseUser.emailVerified === true,
        ...(firebaseUser.email ? { email: firebaseUser.email } : {}),
        ...(firebaseUser.displayName ? { displayName: firebaseUser.displayName } : {}),
      },
    };
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Firebase could not verify your session. Please try again.",
    };
  }
}
