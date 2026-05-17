# MindTrade OS — AI Trading Psychology Operating System

**Track the trader, not just the trades.**

MindTrade is a complete psychology coaching system for day traders. It's NOT a market prediction tool or signal provider. It's an accountability system that monitors emotional risk, detects dangerous trading patterns, and coaches traders toward discipline and process adherence.

---

## What You Get

### Core Pages

1. **Dashboard** (`index.html`) — Central command center
   - Real-time readiness score (0-100)
   - 28-day behaviour heatmap (Green/Yellow/Red)
   - Emotional scoring metrics
   - Quick mindset scan with AI assessment
   - Daily statistics and streaks

2. **Journaling** (`journaling.html`) — Pre and post-session flows
   - Pre-session checklist + AI readiness check
   - Post-session discipline scorecard (0-10 points)
   - Auto-fail detection (revenge trades, broken plans)
   - Daily reflection prompts
   - Saved entries visible anytime

3. **AI Coach** (`aicoach.html`) — Interactive psychology coach
   - Real-time emotional assessment
   - Risk detection (FOMO, revenge, overconfidence, etc.)
   - Trading protocol generation
   - If-Then rule suggestions
   - Status: Green (normal), Yellow (reduced), or Red (no trading)

4. **Methodology** (`methodology.html`) — Trading rules reference
   - 20-Day Trading Discipline Challenge rules
   - Daily scorecard breakdown
   - Dangerous thoughts library
   - Permission state explanations
   - Trader identity framework

### Core Engine

**`mt-core.js`** — Psychology engine powering everything
- Risk detection algorithm (analyzes text for dangerous thoughts)
- Permission state logic (Green/Yellow/Red calculation)
- Readiness score calculation (0-100)
- Daily scorecard auto-calculation
- Mock Claude AI responses (offline mode by default)
- localStorage data management
- CSV export for Google Sheets sync
- Heatmap and analytics data generation

### Google Sheets Integration

**`GOOGLE_SHEETS_SETUP.md`** — Complete Sheets setup guide
- Create your trading journal backup
- Apps Script code for automation
- CSV import/export instructions
- Dashboard formulas for live stats
- Chart templates for trend analysis

---

## Quick Start

### 1. Download All Files

You have 6 files to download:
- `index.html`
- `journaling.html`
- `aicoach.html`
- `methodology.html`
- `mt-core.js`
- `GOOGLE_SHEETS_SETUP.md`

### 2. Deploy (Choose One)

#### Option A: Local Testing (Easiest)

No server needed. Just open the files:

1. Create a folder: `/MindTrade`
2. Drop all 6 files in the folder
3. Open `index.html` in your browser
4. Start journaling

**That's it.** Everything runs offline in your browser.

#### Option B: GitHub Pages (Free Hosting)

1. Create a GitHub account (free)
2. Create a new repo: `mindtrade`
3. Upload all 6 files to the repo
4. Go to repo **Settings → Pages → Source → main branch**
5. GitHub will give you a live URL: `https://yourusername.github.io/mindtrade/`

#### Option C: Netlify (Free, Faster)

1. Go to [netlify.com](https://netlify.com)
2. Sign up (free, uses GitHub)
3. Create new site → Drag & drop your 6 files
4. Done. Get a live URL instantly.

#### Option D: Your Own Server

- Upload to any web host (Bluehost, GoDaddy, AWS, etc.)
- No backend needed — it's 100% frontend
- Point your domain to the folder
- Works anywhere

---

## How to Use

### Day 1: Setup

1. Open `index.html`
2. Click **Start Journal Check-In**
3. Complete pre-session checklist
4. Type how you're feeling
5. Click **Run AI Readiness Check**
6. Get your permission state (Green/Yellow/Red)
7. Trade according to that protocol
8. After trading, complete post-session (automatic 8-point scoring)
9. Score saves automatically

### Every Day After

1. Open dashboard
2. Click **Start Journal Check-In** or **AI Coach**
3. Get your readiness assessment
4. Trade
5. Journal post-session
6. View your stats update on the dashboard

### Weekly

1. Review your heatmap (Green/Yellow/Red days)
2. Look for patterns
3. Export to Google Sheets for backup
4. Share with your trading buddy or coach

---

## The Psychology Framework

### Permission States

| State | Score | What It Means | Trading Rule |
|-------|-------|--------------|--------------|
| 🟢 GREEN | 75+ | Calm, patient, plan-focused | Normal execution allowed |
| 🟡 YELLOW | 55-74 | Mild risk (FOMO, impatience) | Reduce size, fewer trades |
| 🔴 RED | 0-54 | High risk (revenge, desperation) | No live trading |

### Daily Scorecard (0-10 Points)

| Criteria | Points | What You Need |
|----------|--------|---------------|
| Pre-Session Checklist | 1 | Completed before trading |
| Only Planned Setup | 2 | Traded only planned setups |
| Correct Timeframe | 1 | Used 30m or 1H only |
| Risk Respected | 2 | Stayed within risk limits |
| Trade Limit | 1 | Max 2 trades, respected |
| Loss Protocol | 1 | Waited after losses |
| No Revenge/FOMO | 1 | Stayed disciplined |
| Post-Session Journal | 1 | Completed reflection |

**Auto-Fail Rules (Score = 0):**
- Revenge trade executed
- Traded after $500 daily stop
- Moved stop loss further away
- Used lower timeframe entry
- Broken-plan trade

### The Dangerous Thoughts

The AI detects these patterns and flags emotional risk:

**Revenge Trading:**
- "I need to make it back"
- "Recover the loss"
- "Make back quickly"

**FOMO & Chasing:**
- "The move is leaving without me"
- "I'm missing out"
- "Just one more trade"

**Overconfidence:**
- "This looks obvious"
- "I can feel the market"
- "Easy money"
- "I cracked the code"

**Impatience:**
- "Rushed"
- "Hurried"
- "I'll stop after this"

---

## Data & Privacy

### Where Your Data Lives

- **Browser localStorage** — All entries saved locally (private, only you can see)
- **Google Sheets** — Optional backup (you control sharing)
- **CSV exports** — Download anytime

### No Cloud Tracking

- No data sent to Anthropic servers (mock mode)
- No tracking, analytics, or third-party access
- You own 100% of your data

### Adding Real Claude API (Optional)

When you're ready to use real Claude instead of mock:

1. Get an Anthropic API key: [console.anthropic.com](https://console.anthropic.com)
2. In `mt-core.js`, replace the mock `callClaude` function with a real API call
3. Instructions in the code comments

---

## Customization

### Change the Rules

Edit the 20-Day rules in `methodology.html` and the auto-fail conditions in `mt-core.js`.

### Change the Tone

Edit the coaching messages in the `generateMockCoachResponse` function in `mt-core.js`.

### Change the Colors

Edit the CSS variables in `index.html`:

```css
:root {
  --green: #39d98a;
  --yellow: #ffb347;
  --red: #ff647c;
  --cyan: #00f0ff;
}
```

### Add New Risk Patterns

In `mt-core.js`, add to the `DANGEROUS_THOUGHTS` object:

```javascript
'your phrase here': { risk: 'risk_type', severity: 'high' },
```

---

## Troubleshooting

**Q: Where is my data saved?**
A: Browser localStorage. It persists until you clear your browser cache. Back it up to Google Sheets weekly.

**Q: Can I use this on mobile?**
A: Yes, it's responsive. Works on any device with a browser.

**Q: Can multiple people use the same computer?**
A: Yes, but they'll share localStorage. Use separate browsers or Google profiles to keep data separate.

**Q: Can I export all my data?**
A: Yes. Click **⬇ Export All to Sheets** on the dashboard. Get a CSV file you can open in Excel or Google Sheets.

**Q: Can I use this with my trading buddy?**
A: Yes. Export your data as CSV. Share your Google Sheets. Compare stats weekly.

**Q: What if I break a rule?**
A: The auto-fail detection catches it. You get 0/10 that day. It's data. Learn from it and reset tomorrow.

---

## Feature Checklist

✅ Real-time emotional readiness assessment (0-100)  
✅ Permission states (Green/Yellow/Red)  
✅ Daily discipline scoring (0-10) with auto-fail detection  
✅ 28-day behaviour heatmap  
✅ Dangerous thoughts detection  
✅ AI protocol generation for the day  
✅ Pre-session checklist  
✅ Post-session reflection  
✅ Streak tracking  
✅ Statistics dashboard  
✅ CSV export to Google Sheets  
✅ localStorage persistence  
✅ Fully responsive (mobile, tablet, desktop)  
✅ No backend required  
✅ Offline first  
✅ Mock Claude (ready for real API anytime)  

---

## Next Steps

### Immediate

1. Download the 6 files
2. Deploy using Option A, B, C, or D
3. Create your Google Sheet and bookmark the setup guide
4. Start your first pre-session journal

### Week 1

1. Journal every trading day (pre and post)
2. Collect at least 5 entries
3. Notice the patterns the AI detects
4. Export to Google Sheets as backup

### Week 2+

1. Review your heatmap weekly
2. Track your daily score trend
3. Identify your top risk (FOMO? Revenge? Impatience?)
4. Adjust your pre-session protocol based on patterns
5. Share results with trading buddy/coach

---

## The Philosophy

MindTrade operates on 5 core principles:

1. **Discipline over P&L** — Process wins, outcomes follow
2. **Process over Outcome** — Control your actions, not market results
3. **Emotional Awareness over Prediction** — Know yourself before trading
4. **Risk Protection over Trade Frequency** — Miss opportunities, protect capital
5. **Long-term Consistency over Short-term Profit** — Be the same trader every day

**A successful day = 8/10 score, regardless of P&L**
**A failed day = broken rules, even with green P&L**

---

## Support

No email support. This is an open system. You own it, modify it, and improve it.

**Stuck?**
- Read the Methodology page — it explains everything
- Check the inline comments in `mt-core.js`
- Look at the daily scorecard breakdown — it's self-explanatory

**Want to improve it?**
- Customize the rules to fit your trading style
- Add new risk patterns to dangerous thoughts
- Change the colours to match your brand
- Share improvements with other traders using MindTrade

---

## License

MindTrade OS is open. Use it, modify it, share it freely.

No attribution needed. No licensing fees. No usage limits.

This is your trading psychology operating system.

---

## Final Note

MindTrade is NOT:
- A market prediction system
- A signal provider
- A trading strategy
- Financial advice

MindTrade IS:
- A psychology coaching tool
- An emotional risk detector
- A discipline accountability system
- A behavioural operating system for traders

**The goal is simple: Be the same disciplined trader every single day.**

Get started now. Open `index.html`. Start journaling. Watch your discipline improve.

Good luck.
