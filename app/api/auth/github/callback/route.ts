import { NextRequest, NextResponse } from "next/server"
import { GITHUB_OAUTH_CALLBACK_URL } from "@/lib/github-oauth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'github-oauth-error', error: 'No code provided' }, '*');
            window.close();
          </script>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    )
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        // Must match the redirect_uri used in the authorization request.
        redirect_uri: GITHUB_OAUTH_CALLBACK_URL,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const accessToken = tokenData.access_token

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    const userData = await userResponse.json()

    // Return HTML that posts message to opener and closes
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'github-oauth-success',
              token: '${accessToken}',
              user: ${JSON.stringify({
                login: userData.login,
                avatar_url: userData.avatar_url,
                name: userData.name,
              })}
            }, '*');
            window.close();
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    )
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'github-oauth-error',
              error: '${error instanceof Error ? error.message : "Authentication failed"}'
            }, '*');
            window.close();
          </script>
          <p>Authentication failed. You can close this window.</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    )
  }
}
