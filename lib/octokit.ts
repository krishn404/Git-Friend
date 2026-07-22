import { Octokit } from "@octokit/rest"
import { throttling } from "@octokit/plugin-throttling"
import { retry } from "@octokit/plugin-retry"

const ThrottledOctokit = Octokit.plugin(throttling, retry)

let client: InstanceType<typeof ThrottledOctokit> | null = null

export function getOctokit() {
  if (client) return client
  client = new ThrottledOctokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
    request: {
      // conservative request timeout
      timeout: 15_000,
    },
    throttle: {
      onRateLimit: (retryAfter: number, options: any, octokit: any, retryCount: number) => {
        console.warn(
          "[octokit] rate limit hit for %s %s. retrying in %s sec (retry #%s)",
          options.method,
          options.url,
          retryAfter,
          retryCount,
        )
        return retryCount < 1
      },
      onAbuseLimit: (retryAfter: number, options: any) => {
        console.warn(
          "[octokit] abuse limit triggered for %s %s. backing off for %s sec",
          options.method,
          options.url,
          retryAfter,
        )
        return false
      },
    },
  })
  return client
}
