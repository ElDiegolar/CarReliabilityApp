# 🗺️ VIRAL FEATURES - QUICK REFERENCE & NAVIGATION

## 📍 WHERE TO FIND EVERYTHING

### 🎯 **USER-FACING FEATURES**

| Feature | Location | Route | File |
|---------|----------|-------|------|
| Shareable Badges | Search results | `/search` | `components/ShareableBadges.js` |
| Roast Mode | Search results | `/search` | `components/RoastMode.js` |
| Lemon Hunt | Search results | `/search` | `components/LemonHuntChallenge.js` |
| Community Feed | Search results | `/search` | `components/CommunityFeed.js` |
| AR Filter | Search results | `/search` | `components/ARFilter.js` |
| Challenges Hub | Dedicated page | `/challenges` | `pages/challenges.js` |
| Viral Dashboard | User metrics | `/viral-dashboard` | `pages/viral-dashboard.js` |
| Browser Extension | Marketplace sites | Various | `browser-extension/` |

---

### 🔌 **API ENDPOINTS**

#### Generate Roast
```
POST /api/generate-roast
Body: { year, make, model, score, issues }
Response: { roast }
```

#### Challenge Management
```
GET /api/challenges/current           - Get active challenge
GET /api/challenges/leaderboard       - Get rankings
GET /api/challenges/list              - List all challenges
POST /api/challenges/submit           - Submit to challenge
```

#### Community
```
GET /api/community/posts?filter=      - Get feed (trending|recent|my-network)
```

#### Viral Metrics
```
GET /api/viral/metrics                - User's viral stats
```

---

### 📁 **FILE STRUCTURE**

```
CarReliabilityApp/
├── components/
│   ├── ShareableBadges.js        ✅ Badge generator
│   ├── RoastMode.js              ✅ Humor generator
│   ├── LemonHuntChallenge.js     ✅ Challenge system
│   ├── CommunityFeed.js          ✅ Feed component
│   └── ARFilter.js               ✅ AR integration
│
├── pages/
│   ├── search.js                 🔄 MODIFIED (added all components)
│   ├── challenges.js             ✅ Challenges hub
│   ├── viral-dashboard.js        ✅ Metrics dashboard
│   ├── test-analytics.js         ✅ Testing page
│   └── api/
│       ├── generate-roast.js     ✅ Roast API
│       ├── challenges/
│       │   ├── current.js        ✅ Active challenge
│       │   ├── leaderboard.js    ✅ Rankings
│       │   ├── submit.js         ✅ Submit to challenge
│       │   └── list.js           ✅ All challenges
│       ├── community/
│       │   └── posts.js          ✅ Community feed
│       └── viral/
│           └── metrics.js        ✅ User metrics
│
├── browser-extension/
│   ├── manifest.json             ✅ Extension config
│   ├── content.js                ✅ Badge injection
│   └── background.js             ✅ Service worker
│
├── lib/
│   └── viral-metrics.js          ✅ Tracking utilities
│
└── Documentation/
    ├── VIRAL_FEATURES.md         ✅ Feature guide
    ├── VIRAL_TESTING.md          ✅ Testing guide
    ├── IMPLEMENTATION_SUMMARY.md ✅ Project summary
    └── This file                 ✅ Navigation guide
```

---

## 🎬 **USER JOURNEYS**

### Journey 1: Share & Go Viral 📸
```
1. User searches vehicle (/search)
2. Gets reliability score
3. Generates shareable badge
4. Exports to Twitter/TikTok/etc
5. Tracks share analytics
6. Earns social proof points
```

### Journey 2: Hunt Lemons 🍋
```
1. User searches bad car (/search)
2. Gets low reliability score
3. Submits to Lemon Hunt Challenge
4. Earns points (50pts for low score)
5. Climbs leaderboard
6. Earns badges
7. Views progress on dashboard (/viral-dashboard)
```

### Journey 3: Laugh & Meme 🎤
```
1. User searches vehicle (/search)
2. Generates AI roast
3. Shares roast as meme/tweet
4. Gets engagement on social
5. Tracking shows viral coefficient
```

### Journey 4: Community Discovery 🌐
```
1. User browses Community Feed (/search)
2. Likes/comments on posts
3. Follows top hunters
4. Builds network
5. Sees "My Network" feed
```

### Journey 5: Marketplace Shopping 🛒
```
1. User browses Facebook Marketplace
2. Browser extension injects Lemnaed badge
3. Sees reliability score on listing
4. Clicks to check full report (/search)
5. Either passes (lemon) or saves
```

---

## 🛠️ **COMPONENT INTEGRATION POINTS**

### In `pages/search.js` (Lines ~570-590)
```javascript
// After DownloadPdfButton, before search-actions:

<ShareableBadges 
  vehicleData={results}
  searchParams={formData}
  reliabilityScore={results.reliability_score}
/>

<RoastMode
  vehicleData={results}
  searchParams={formData}
  reliabilityScore={results.reliability_score}
/>

<LemonHuntChallenge
  vehicleData={results}
  searchParams={formData}
  reliabilityScore={results.reliability_score}
/>

<ARFilter
  vehicleData={formData}
  reliabilityScore={results.reliability_score}
/>

<CommunityFeed />
```

---

## 📊 **ANALYTICS EVENTS TRACKED**

```javascript
// Share tracking
gtag('event', 'share', {
  platform: 'twitter|facebook|reddit|tiktok|instagram',
  vehicle: 'year_make_model'
})

// Badge generation
gtag('event', 'badge_downloaded')
gtag('event', 'badge_generated')

// Challenge participation
gtag('event', 'challenge_submitted', { score, challenge_id })
gtag('event', 'badge_earned', { badge_name })

// Community engagement
gtag('event', 'post_liked', { post_id })
gtag('event', 'post_shared', { post_id })
gtag('event', 'post_commented', { post_id })

// Viral metrics
gtag('event', 'viral_coefficient', { coefficient: x.xx })
gtag('event', 'referral_conversion', { referrer_id, converted_user_id })
```

---

## 🔍 **TESTING QUICK LINKS**

### Feature Testing
- Badges: Search → Scroll → "📸 Share Your Reliability Check"
- Roasts: Search → Scroll → "🎤 Roast This Car"
- Challenges: Search → Scroll → "🍋 Weekly Lemon Hunt Challenge"
- Dashboard: Visit `/viral-dashboard`
- Challenges Hub: Visit `/challenges`

### API Testing
```bash
# Generate roast
curl -X POST http://localhost:3000/api/generate-roast \
  -H "Content-Type: application/json" \
  -d '{"year":"2020","make":"Toyota","model":"Camry","score":75,"issues":[]}'

# Get current challenge
curl http://localhost:3000/api/challenges/current

# Get leaderboard
curl http://localhost:3000/api/challenges/leaderboard

# Get community feed
curl "http://localhost:3000/api/community/posts?filter=trending"

# Get viral metrics
curl http://localhost:3000/api/viral/metrics
```

### Console Testing
```javascript
// Check viral metrics functions
console.log('trackShare:', typeof trackShare);
console.log('trackBadgeEarned:', typeof trackBadgeEarned);
console.log('trackChallengeParticipation:', typeof trackChallengeParticipation);

// Manually trigger analytics
trackShare('twitter', { year: 2020, make: 'Toyota', model: 'Camry' });
```

---

## 🚀 **LAUNCH CHECKLIST**

### Database Setup
- [ ] Create `challenges` table
- [ ] Create `challenge_submissions` table
- [ ] Create `community_posts` table
- [ ] Create `badges` table
- [ ] Create `user_follows` table
- [ ] Seed mock challenges
- [ ] Seed mock community posts

### Browser Extension
- [ ] Package extension (.zip)
- [ ] Create Chrome Web Store listing
- [ ] Set up support email
- [ ] Create extension landing page
- [ ] Submit for approval

### Marketing
- [ ] Identify 20 micro-influencers
- [ ] Prepare seed Reddit posts
- [ ] Create Twitter/X campaign hashtags
- [ ] Set up Facebook group strategy
- [ ] Create TikTok seeding plan

### Monitoring
- [ ] GA4 dashboard setup
- [ ] Real-time alerts configured
- [ ] Viral coefficient tracking
- [ ] Share rate monitoring
- [ ] Conversion tracking

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### Component Issues
| Issue | Fix |
|-------|-----|
| Component not showing | Check results object; scroll down |
| Badge not rendering | Check canvas support; verify vehicle data |
| Roast API fails | Check OpenAI key; verify internet connection |
| Social share error | Check popup blocker settings |

### API Issues
| Endpoint | Check |
|----------|-------|
| /generate-roast | OpenAI API key, network connection |
| /challenges/* | Database tables exist, mock data seeded |
| /community/posts | Database tables exist, seed posts |
| /viral/metrics | User authentication, mock data loaded |

### Extension Issues
| Issue | Fix |
|-------|-----|
| Badge not injecting | Check manifest.json, reload extension |
| Parse error | Verify vehicle data format in page |
| API timeout | Check CORS headers, API endpoint |

---

## 📚 **DOCUMENTATION HIERARCHY**

```
1. IMPLEMENTATION_SUMMARY.md (START HERE)
   ↓ Overview, status, deployment guide
   ↓
2. VIRAL_FEATURES.md (DETAILED)
   ↓ Each feature explained, code samples
   ↓
3. VIRAL_TESTING.md (TESTING)
   ↓ Step-by-step testing for each feature
   ↓
4. This file (NAVIGATION)
   ↓ Quick reference, quick links
```

---

## ⚡ **QUICK COMMANDS**

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests (if configured)
npm test

# Package extension
cd browser-extension && zip -r lemnaed-extension.zip . -x "*.git*"
```

---

## 🎯 **SUCCESS METRICS TO TRACK**

| Metric | Target | Location |
|--------|--------|----------|
| Shares per search | 6x | GA4, /viral-dashboard |
| Viral coefficient | 4x+ | /viral-dashboard |
| Challenge participation | 50%+ | /challenges leaderboard |
| Extension installs | 50K/month | Chrome Web Store |
| Community posts/day | 100+ | /api/community/posts |
| Badge earned | 5+ per user | /viral-dashboard |
| Referral conversion | 10%+ | GA4 events |

---

**Last Updated:** November 14, 2025
**Status:** ✅ COMPLETE & READY
**Next Action:** Database setup & browser extension packaging