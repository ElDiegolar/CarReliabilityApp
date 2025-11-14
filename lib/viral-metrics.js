// lib/viral-metrics.js - Track viral growth metrics
export const viralMetrics = {
  // Track share metrics
  trackShare: (platform, vehicleData) => {
    if (window.gtag) {
      window.gtag('event', 'share', {
        event_category: 'viral',
        event_label: `share_${platform}`,
        value: 1,
        platform: platform,
        vehicle: `${vehicleData.year}_${vehicleData.make}_${vehicleData.model}`
      });
    }
  },

  // Track viral coefficient (shares per search)
  trackViralCoefficient: (shares, searches) => {
    const coefficient = searches > 0 ? shares / searches : 0;
    if (window.gtag) {
      window.gtag('event', 'viral_coefficient', {
        event_category: 'viral',
        coefficient: coefficient.toFixed(2),
        shares: shares,
        searches: searches
      });
    }
  },

  // Track referral conversion
  trackReferralConversion: (referrerId, convertedUserId) => {
    if (window.gtag) {
      window.gtag('event', 'referral_conversion', {
        event_category: 'viral',
        referrer_id: referrerId,
        converted_user_id: convertedUserId
      });
    }
  },

  // Track badge earned
  trackBadgeEarned: (badgeName, challengeId) => {
    if (window.gtag) {
      window.gtag('event', 'badge_earned', {
        event_category: 'gamification',
        badge_name: badgeName,
        challenge_id: challengeId
      });
    }
  },

  // Track challenge participation
  trackChallengeParticipation: (challengeId, score) => {
    if (window.gtag) {
      window.gtag('event', 'challenge_participation', {
        event_category: 'viral',
        challenge_id: challengeId,
        score: score
      });
    }
  },

  // Track social proof (likes, comments)
  trackSocialProof: (action, postId, value) => {
    if (window.gtag) {
      window.gtag('event', `social_proof_${action}`, {
        event_category: 'community',
        post_id: postId,
        value: value
      });
    }
  },

  // Track FOMO triggers (trending, challenges expiring)
  trackFOMO: (triggerType, urgencyLevel) => {
    if (window.gtag) {
      window.gtag('event', 'fomo_trigger', {
        event_category: 'viral',
        trigger_type: triggerType,
        urgency_level: urgencyLevel
      });
    }
  },

  // Calculate viral growth stats
  calculateGrowthMetrics: (data) => {
    return {
      shareRate: data.totalShares / data.totalSearches,
      conversionFromShare: data.conversionsFromShare / data.totalShares,
      repeatingVisitors: data.visitorsFromShare / data.totalVisitors,
      averageShares: data.totalShares / data.uniqueSearchers,
      challengeParticipation: data.challengeSubmissions / data.totalUsers
    };
  },

  // Get viral coefficient targets
  getViralTargets: () => {
    return {
      excellent: 6, // 6x coefficient
      good: 3,      // 3x coefficient
      ok: 1.5,      // 1.5x coefficient
      target: 4     // 4x target
    };
  }
};

// Export individual track functions for easy import
export const trackShare = viralMetrics.trackShare;
export const trackReferralConversion = viralMetrics.trackReferralConversion;
export const trackBadgeEarned = viralMetrics.trackBadgeEarned;
export const trackChallengeParticipation = viralMetrics.trackChallengeParticipation;
export const trackSocialProof = viralMetrics.trackSocialProof;
export const trackFOMO = viralMetrics.trackFOMO;