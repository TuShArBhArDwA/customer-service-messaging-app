// Urgency scoring algorithm
export function calculateUrgency(content: string, loanStatus?: string): number {
  let score = 20 // Base score

  // High urgency keywords
  const criticalKeywords = [
    "approval",
    "disburse",
    "disbursement",
    "when",
    "urgent",
    "asap",
    "emergency",
    "need",
    "must",
    "immediately",
  ]

  // Medium urgency keywords
  const mediumKeywords = ["update", "change", "edit", "application", "status", "loan"]

  const lowerContent = content.toLowerCase()

  // Check critical keywords
  criticalKeywords.forEach((keyword) => {
    if (lowerContent.includes(keyword)) {
      score += 25
    }
  })

  // Check medium keywords
  mediumKeywords.forEach((keyword) => {
    if (lowerContent.includes(keyword)) {
      score += 10
    }
  })

  // Boost score based on loan status
  if (loanStatus === "pending_approval") score += 20
  if (loanStatus === "approved") score += 15
  if (loanStatus === "disbursed") score += 10

  // Cap at 100
  return Math.min(score, 100)
}
