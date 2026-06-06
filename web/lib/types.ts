export type ProductType = 'savings' | 'fund' | 'credit_card'
export type RiskLevel = 'low' | 'medium' | 'high'
export type Goal = 'save' | 'grow' | 'spend' | 'learn'

export interface UserProfile {
  age: number
  monthly_income: number
  goal: Goal
  risk_appetite: RiskLevel
  investment_horizon_months?: number
  notes?: string
}

export interface Product {
  id: string
  name: string
  provider: string
  type: ProductType
  risk_level: RiskLevel
  interest_rate_pct?: number | null
  expected_return_pct?: number | null
  annual_fee_vnd?: number | null
  min_amount_vnd?: number | null
  min_income_vnd?: number | null
  min_age: number
  term_months?: number | null
  description: string
  source_url: string
  updated_at: string
}

export interface Reasoning {
  pros: string[]
  cons: string[]
  score: number
  score_breakdown: Record<string, number>
  llm_rationale?: string | null
  citations?: Citation[]
}

export interface Citation {
  chunk_id: string
  source: string
  snippet: string
}

export interface Recommendation {
  product: Product
  reasoning: Reasoning
  rank: number
}

export interface ComplianceCheck {
  passed: boolean
  disclaimer: string
  warnings: string[]
}

export interface TraceEntry {
  agent: string
  action: string
  summary: string
}

export interface RecommendResponse {
  recommendations: Recommendation[]
  compliance: ComplianceCheck
  trace: TraceEntry[]
  llm_provider: string
}
