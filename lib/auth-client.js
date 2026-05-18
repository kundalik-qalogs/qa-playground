import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // cache for 5 minutes
    },
  },
});

// Named exports for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
