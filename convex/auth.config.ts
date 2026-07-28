import type { AuthConfig } from "convex/server";

// Firebase ID tokens are RS256 JWTs issued for the Firebase project. Set this
// variable in the Convex deployment settings; it must match
// NEXT_PUBLIC_FIREBASE_PROJECT_ID used by the Next.js client.
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID!;

export default {
  providers: [
    {
      type: "customJwt",
      applicationID: firebaseProjectId,
      issuer: `https://securetoken.google.com/${firebaseProjectId}`,
      jwks: "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig;
