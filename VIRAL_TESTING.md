# 🧪 VIRAL FEATURES - QUICK START TESTING GUIDE

## Getting Started

### 1. **Start the Development Server**
```bash
npm run dev
```
Visit `http://localhost:3000`

---

## 🧪 Testing Each Feature

### ✅ **1. Shareable Badges**
**Location:** `/search` → Search for any car → Scroll to "📸 Share Your Reliability Check"

**What to Test:**
- [ ] Click "✅ Trusted", "🏆 Winner", "🍋 Lemon Alert" buttons to change badge style
- [ ] Click "⬇️ Download Image" to download PNG badge
- [ ] Click "🔗 Copy Link" and paste URL (should contain query params)
- [ ] Click social buttons (𝕏, f, ♪, ⓡ, ◼) to open share dialogs
- [ ] Verify watermark says "lemnaed.com • Free AI Check"
- [ ] Check console for `trackMicroConversion` events

**Expected Behavior:**
- Badge canvas renders with score, vehicle name, savings estimate
- Social share URLs open in new windows
- Link copied to clipboard shows checkmark

---

### ✅ **2. AI Roast Mode**
**Location:** `/search` → Search for any car → Scroll to "🎤 Roast This Car"

**What to Test:**
- [ ] Click "🔥 Generate Roast" button
- [ ] Wait for OpenAI API response (~2-3 seconds)
- [ ] Verify roast text appears and is contextual to the car
- [ ] Click "📋 Copy" and paste roast (should be in clipboard)
- [ ] Click "🔄 Regenerate" for different roast
- [ ] Share to 𝕏, ⓡ, ♪ platforms
- [ ] Verify warning disclaimer appears

**Expected Behavior:**
- Loading state shows "⏳ Roasting..."
- Roast is 1-2 sentences, sarcastic, car-specific
- Different regenerations produce different roasts
- Copy works and shows "✅ Copied!" feedback

---

### ✅ **3. Lemon Hunt Challenge**
**Location:** `/search` → Search for any car → Scroll to "🍋 Weekly Lemon Hunt Challenge"

**What to Test:**
- [ ] View current challenge details
- [ ] If logged in: Click "📤 Submit This Car"
- [ ] Verify success box shows "+100 points earned" (or points value)
- [ ] Check leaderboard shows top 5 hunters
- [ ] View 4 badges offered
- [ ] Read challenge rules
- [ ] Verify all challenge metadata (days remaining, prize, hunter count)

**Expected Behavior:**
- Challenge loads with title, description, prize amount
- Points awarded based on score (50pts for low scores)
- Success message shows after submission
- Badges display 4 different achievement types

---

### ✅ **4. Community Feed**
**Location:** `/search` → Search for any car → Scroll to "🌐 Community Feed"

**What to Test:**
- [ ] Switch between "🔥 Trending", "⏰ Recent", "👥 My Network" tabs
- [ ] Click "❤️ Like" button (heart turns red)
- [ ] Click "💬 Comment" button
- [ ] Click "🔄 Share" button to open share dialog
- [ ] Scroll through mock posts
- [ ] View user avatars, scores, timestamps
- [ ] Check engagement stats (likes, comments, shares)

**Expected Behavior:**
- Posts load and filter by selected tab
- Like button toggles and changes color
- Share opens social share windows
- Post scores show with appropriate coloring (green 80+, orange 60-80, red <60)

---

### ✅ **5. AR Filter Integration**
**Location:** `/search` → Search for any car → Scroll to "🎬 AR Experience"

**What to Test:**
- [ ] View AR preview with score
- [ ] If device supports AR: interact with preview
- [ ] Click "📱 Share on Snapchat" 
- [ ] Click "📸 Share on Instagram"
- [ ] Read "How AR Filters Work" instructions

**Expected Behavior:**
- Preview shows score and emoji indicator
- Snapchat/Instagram links open share dialogs
- Instructions display how to use AR

---

### 📄 **6. Challenges Page**
**Location:** `/challenges` route

**What to Test:**
- [ ] View all active challenges
- [ ] See challenge cards with:
  - Title and description
  - Prize amount and hunter count
  - Progress bar
  - Reward badges
  - "View Challenge" button
- [ ] Scroll to "How It Works" section (4 steps)
- [ ] View badge showcase with 6 badge types
- [ ] Verify responsive design on mobile

**Expected Behavior:**
- Multiple challenge cards display
- Each card shows realistic participant counts
- Progress bars animate
- Steps guide explains gamification
- Badges show emoji + name + requirement

---

### 📊 **7. Viral Dashboard**
**Location:** `/viral-dashboard` route

**What to Test:**
- [ ] If not logged in: Show login message
- [ ] If logged in: View KPI cards:
  - Total Shares
  - Viral Coefficient (x.x format)
  - Referral Conversions
  - Challenge Wins
  - Badges Earned
  - Total Points
- [ ] Platform breakdown (TikTok, Twitter, Reddit, Facebook, Instagram)
- [ ] Badge showcase showing earned badges
- [ ] Challenge performance metrics
- [ ] Quick action cards for next steps

**Expected Behavior:**
- All metrics display with appropriate icons
- Platform shares show realistic numbers
- Badges show earned date
- Performance cards show percentages
- Action cards link to relevant pages

---

### 🔌 **8. Browser Extension** (Manual Setup)
**Files:** `browser-extension/` folder

**Setup:**
1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `browser-extension` folder
5. Open Facebook Marketplace or Craigslist listing

**What to Test:**
- [ ] Reliability badge appears in top-right corner
- [ ] Badge shows score /100 with color coding
- [ ] Badge is clickable and opens Lemnaed search results
- [ ] Badge appears on multiple listings
- [ ] Extension works across different marketplace sites

**Expected Behavior:**
- Red badge appears within 2-3 seconds
- Clicking opens new tab with search results
- Badge updates when navigating between listings

---

## 📱 Mobile Testing

Test on multiple viewports:
```
Mobile: 375px
Tablet: 768px
Desktop: 1200px
```

**Checklist:**
- [ ] All components responsive
- [ ] Social buttons stack properly
- [ ] Challenge leaderboard readable
- [ ] Badges wrap correctly
- [ ] Touch interactions work
- [ ] No horizontal scroll

---

## 🔍 Console Testing

Open DevTools (F12) → Console tab:

```javascript
// Check viral metrics loaded
console.log('Viral metrics:', window.viralMetrics);

// Manually trigger tracking
window.gtag('event', 'test_share', { platform: 'twitter' });

// Check analytics functions
console.log('trackShare exists:', typeof window.trackShare);
console.log('trackBadgeEarned exists:', typeof window.trackBadgeEarned);
```

---

## 📊 Google Analytics Verification

**In DevTools → Network tab:**

Look for requests to:
- `www.google-analytics.com/mp/collect`
- Check payload for event names like `share`, `viral_coefficient`, `badge_earned`

**In GA4 Dashboard:**
1. Go to Google Analytics 4 property
2. Check Real-time events
3. Filter by event names:
   - `share` 
   - `viral_coefficient`
   - `challenge_participation`
   - `badge_earned`

---

## 🎯 Quick Test Flow

**Complete User Journey (5 mins):**
1. Search for "2020 Toyota Camry"
2. View results
3. Generate shareable badge
4. Share to Twitter
5. Generate roast
6. Submit to Lemon Hunt Challenge
7. Browse Community Feed
8. Visit `/challenges` page
9. Check `/viral-dashboard`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Components not showing | Check if search returned results; scroll down |
| Roast API errors | Verify OpenAI key in `.env.local` |
| Badge not downloading | Check browser download permissions |
| Challenge won't submit | Must be logged in as user |
| Social shares not opening | Check browser popup blocker |
| Dashboard shows no metrics | Must be logged in; mock data loads if DB empty |

---

## ✅ Sign-Off Checklist

Before declaring viral features complete:

- [ ] All 5 search result components render
- [ ] All social share buttons work
- [ ] Challenges page loads with mock data
- [ ] Dashboard loads with metrics
- [ ] Analytics events fire in console
- [ ] Mobile responsive design works
- [ ] Browser extension injects badges
- [ ] No JavaScript console errors
- [ ] Navigation links all work
- [ ] Styling matches design system

---

## 🚀 Next Level Testing

Once basic testing passes:

1. **Load Testing:** Search for 100 vehicles, measure performance
2. **Social Verification:** Actual shares on Twitter/Reddit
3. **User Feedback:** Show to 10 users, gather feedback
4. **A/B Testing:** Test badge colors, roast tone, challenge names
5. **Analytics Review:** Check viral coefficient tracking accuracy

---

**Happy Testing! 🎉**