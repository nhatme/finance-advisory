import type { RecommendResponse, UserProfile } from './types'

const DISCLAIMER =
  'Thông tin trên chỉ mang tính tham khảo, không phải khuyến nghị đầu tư hoặc tư vấn pháp lý/tài chính. Vui lòng kiểm tra trực tiếp với nhà cung cấp.'

export function mockRecommend(profile: UserProfile): RecommendResponse {
  return {
    recommendations: [
      {
        rank: 1,
        product: {
          id: 'tcb-savings-12m',
          name: 'Tiết kiệm Phát Lộc 12 tháng',
          provider: 'Techcombank',
          type: 'savings',
          risk_level: 'low',
          interest_rate_pct: 5.4,
          term_months: 12,
          min_amount_vnd: 3_000_000,
          min_age: 18,
          description: 'Tiết kiệm online kỳ hạn 12 tháng, lãi suất ưu đãi.',
          source_url: 'https://www.techcombank.com.vn/',
          updated_at: '2026-05-01',
        },
        reasoning: {
          pros: ['Rủi ro thấp khớp khẩu vị', 'Lãi suất cao trong nhóm 12 tháng'],
          cons: ['Khoá vốn 12 tháng — kém linh hoạt'],
          score: 0.91,
          score_breakdown: {
            risk_alignment: 1.0,
            goal_alignment: 1.0,
            income_compat: 1.0,
            amount_feasibility: 0.8,
            horizon_match: 0.75,
          },
        },
      },
      {
        rank: 2,
        product: {
          id: 'vcbf-bond',
          name: 'Quỹ Trái phiếu VCBF-FIF',
          provider: 'VCBF',
          type: 'fund',
          risk_level: 'low',
          expected_return_pct: 6.8,
          min_amount_vnd: 1_000_000,
          min_age: 18,
          description: 'Quỹ mở trái phiếu, rủi ro thấp, kỳ vọng ổn định.',
          source_url: 'https://vcbf.com/',
          updated_at: '2026-05-01',
        },
        reasoning: {
          pros: ['Đa dạng hoá khỏi tiết kiệm thuần', 'Vốn tối thiểu thấp'],
          cons: ['NAV có thể biến động nhẹ'],
          score: 0.83,
          score_breakdown: {
            risk_alignment: 1.0,
            goal_alignment: 0.55,
            income_compat: 1.0,
            amount_feasibility: 1.0,
            horizon_match: 0.7,
          },
        },
      },
    ],
    compliance: {
      passed: true,
      disclaimer: DISCLAIMER,
      warnings: ['Kết quả ở chế độ MOCK — backend chưa kết nối'],
    },
    trace: [
      { agent: 'Profiler', action: 'enrich', summary: `income=${profile.monthly_income}` },
      { agent: 'Researcher', action: 'hybrid_retrieve', summary: '2 ứng viên (mock)' },
      { agent: 'Recommender', action: 'score_rank_explain', summary: 'top-2 (mock)' },
      { agent: 'Compliance', action: 'suitability_check', summary: 'ok (mock)' },
    ],
  }
}
