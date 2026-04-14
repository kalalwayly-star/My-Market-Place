export function updateTrustScore(user, fraudResult) {
    if (!user.trustScore && user.trustScore !== 0) {
        user.trustScore = 50;
    }

    if (fraudResult.score >= 70) {
        user.trustScore -= 20;
        user.flaggedCount = (user.flaggedCount || 0) + 1;
    } 
    else if (fraudResult.score >= 40) {
        user.trustScore -= 5;
    } 
    else {
        user.trustScore += 5;
    }

    // clamp values
    user.trustScore = Math.max(0, Math.min(100, user.trustScore));

    return user;
}