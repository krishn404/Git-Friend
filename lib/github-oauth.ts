/**
 * GitHub permits one OAuth App callback URL. Keep the authorization request
 * and token exchange on the same canonical production URL, rather than using
 * the host that happened to render the client (for example a Vercel preview).
 */
export const GITHUB_OAUTH_CALLBACK_URL = "https://gitfriend.xyz/api/auth/github/callback";
