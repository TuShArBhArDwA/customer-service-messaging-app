// Urgency scoring algorithm
export function calculateUrgency(content: string, loanStatus?: string): number {
  let score = 20 // Base score

  // Critical urgency keywords (loan approval/disbursement related)
  const criticalKeywords = [
    "approval",
    "approve",
    "disburse",
    "disbursement",
    "disbursed",
    "when will",
    "when can",
    "how long",
    "urgent",
    "asap",
    "as soon as",
    "emergency",
    "need immediately",
    "must",
    "critical",
    "important",
    "time sensitive",
  ]

  // High urgency keywords (loan status and payment related)
  const highKeywords = [
    "loan status",
    "application status",
    "pending",
    "rejected",
    "denied",
    "payment due",
    "overdue",
    "late payment",
    "default",
    "collection",
    "fraud",
    "unauthorized",
    "hacked",
    "stolen",
  ]

  // Medium urgency keywords (account updates and general queries)
  const mediumKeywords = [
    "update",
    "change",
    "edit",
    "modify",
    "application",
    "status",
    "loan",
    "account",
    "information",
    "details",
    "verify",
    "confirm",
  ]

  const lowerContent = content.toLowerCase()

  // Check for critical phrases (more weight for phrases)
  const criticalPhrases = [
    "when will my loan",
    "when can i get",
    "loan approval",
    "loan disbursement",
    "when will it be",
    "how long until",
    "need the money",
    "urgent need",
  ]

  criticalPhrases.forEach((phrase) => {
    if (lowerContent.includes(phrase)) {
      score += 30
    }
  })

  // Check critical keywords
  criticalKeywords.forEach((keyword) => {
    if (lowerContent.includes(keyword)) {
      score += 20
    }
  })

  // Check high urgency keywords
  highKeywords.forEach((keyword) => {
    if (lowerContent.includes(keyword)) {
      score += 15
    }
  })

  // Check medium keywords (but limit the boost)
  let mediumCount = 0
  mediumKeywords.forEach((keyword) => {
    if (lowerContent.includes(keyword)) {
      mediumCount++
    }
  })
  score += Math.min(mediumCount * 5, 15) // Cap medium keyword boost

  // Boost score based on loan status
  if (loanStatus === "pending_approval") score += 25
  if (loanStatus === "approved") score += 20
  if (loanStatus === "disbursed") score += 10
  if (loanStatus === "rejected") score += 15

  // Boost for questions about timing (loan approval/disbursement)
  if (
    (lowerContent.includes("when") || lowerContent.includes("how long")) &&
    (lowerContent.includes("loan") || lowerContent.includes("approval") || lowerContent.includes("disburs"))
  ) {
    score += 20
  }

  // Boost for exclamation marks (indicates urgency)
  const exclamationCount = (content.match(/!/g) || []).length
  score += Math.min(exclamationCount * 3, 10)

  // Boost for all caps (indicates urgency)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / Math.max(content.length, 1)
  if (capsRatio > 0.3) {
    score += 10
  }

  // Cap at 100
  return Math.min(score, 100)
}
