import type { RecommendResponse, UserProfile } from './types'
import { mockRecommend } from './mock'

function getApiUrl(): string {
  // Explicit override wins — use this in production for a separate API domain.
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  // In the browser: mirror the current hostname so localhost, LAN IP, and
  // production hosts all work without rebuilding the app.
  if (typeof window !== 'undefined') {
    const port = process.env.NEXT_PUBLIC_API_PORT || '8000'
    return `${window.location.protocol}//${window.location.hostname}:${port}`
  }
  return 'http://localhost:8000'
}

export async function recommend(profile: UserProfile): Promise<RecommendResponse> {
  try {
    const res = await fetch(`${getApiUrl()}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as RecommendResponse
  } catch (err) {
    console.warn('[api] backend unreachable, falling back to mock:', err)
    return mockRecommend(profile)
  }
}
