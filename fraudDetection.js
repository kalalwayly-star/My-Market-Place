// fraudDetection.js

function evaluateAd(ad, user) {
    let score = 0;
    let reasons = [];

    if (!ad.title || ad.title.length < 5) {
        score += 20;
        reasons.push("Title too short");
    }

    if (ad.price && ad.price < 5) {
        score += 30;
        reasons.push("Price suspiciously low");
    }

    if (!user || user.trustScore < 40) {
        score += 25;
        reasons.push("Low user trust score");
    }

    let riskLevel = "Low";
    if (score >= 70) riskLevel = "High";
    else if (score >= 40) riskLevel = "Medium";

    return { score, reasons, riskLevel };
}  // -------------------------
  // 1. TEXT ANALYSIS
  // -------------------------
  const suspiciousKeywords = [
    "urgent sale",
    "contact me on whatsapp",
    "pay deposit",
    "western union",
    "moneygram",
    "limited time offer",
    "act fast"
  ];

  const text = (ad.title + " " + ad.description).toLowerCase();

  suspiciousKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 15;
      reasons.push(`Suspicious keyword: "${keyword}"`);
    }
  });

  // -------------------------
  // 2. PRICE ANOMALY
  // -------------------------
  if (ad.price && ad.categoryAveragePrice) {
    if (ad.price < ad.categoryAveragePrice * 0.5) {
      score += 25;
      reasons.push("Price is unusually low");
    }
  }

  // -------------------------
  // 3. USER TRUST
  // -------------------------
  if (!user.verified) {
    score += 10;
    reasons.push("User not verified");
  }

  if (user.accountAgeDays < 3) {
    score += 20;
    reasons.push("New account");
  }

  if (user.previousReports > 0) {
    score += user.previousReports * 10;
    reasons.push("User has previous reports");
  }

  // -------------------------
  // 4. IMAGE CHECK (basic)
  // -------------------------
  if (ad.images && ad.images.length === 0) {
    score += 10;
    reasons.push("No images provided");
  }

  // -------------------------
  // FINAL RESULT
  // -------------------------
  return {
    score,
    reasons,
    riskLevel: getRiskLevel(score)
  };


// -------------------------
// Risk level helper
// -------------------------
function getRiskLevel(score) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}