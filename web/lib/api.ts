import type { RecommendResponse, UserProfile } from './types'
import { mockRecommend } from './mock'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function recommend(profile: UserProfile): Promise<RecommendResponse> {
  try {
    const res = await fetch(`${API_URL}/recommend`, {
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
