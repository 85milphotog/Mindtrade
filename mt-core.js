// ═══════════════════════════════════════════════════════════════
// MindTrade OS — Core Psychology Engine
// Discipline, Risk Detection, Permission States, Scoring
// ═══════════════════════════════════════════════════════════════

const MT = {
  // ─── Data Model ──────────────────────────────────────────────
  STORAGE_KEY: 'MT_entries',
  API_KEY_STORAGE: 'MT_api_key',
  COACH_SYSTEM: `You are a professional trading psychologist and performance coach for day traders. Your role is NOT to predict markets, suggest trades, or give financial advice.

Your job is to:
1. Detect emotional risks in the trader's mindset (revenge trading, FOMO, overconfidence, impatience)
2. Assess readiness on a scale 0-100 based on emotional state, plan adherence, and discipline
3. Assign a permission state: GREEN (normal trading), YELLOW (reduced size/slower), or RED (no trading recommended)
4. Identify specific dangerous thoughts and what emotional risk they signal
5. Generate a concrete trading protocol for the session
6. Coach the trader on process, not outcomes

Always separate behaviour from identity. Never shame. Be direct, calm, practical, and trader-specific.

The trader is following the 20-Day Trading Discipline Challenge:
- Max 2 trades per day
- One winner and done
- Stop after 2 losses
- Stop immediately after 1 broken-plan trade
- Risk per trade: $150-$200
- Daily max loss: $500 hard stop
- Weekly max loss: $800-$1,000 or 3 red days
- Only 30m and 1H execution
- No lower timeframe entries
- After a loss, wait one full 30m candle close
- No trading if market is ranging
- Max 90 min active screen time
- Pre-session checklist required
- Post-session journal required

RESPOND ONLY IN THIS JSON FORMAT (no markdown, no preamble):
{
  "status": "GREEN" or "YELLOW" or "RED",
  "score": 0-100,
  "headline": "short summary of state",
  "message": "1-2 sentence coaching note",
  "risks": ["risk1", "risk2"],
  "strengths": ["strength1", "strength2"],
  "protocol": ["rule1", "rule2", "rule3"],
  "redFlags": ["thought1", "thought2"],
  "ifThen": "If [trigger], then [action]"
}`,

  // ─── Initialize ───────────────────────────────────────────────
  init() {
    console.log('MT Core initialized');
    this.ensureDataStructure();
  },

  ensureDataStructure() {
    if (!this.getAllEntries()) {
      this.saveEntries([]);
    }
  },

  // ─── Entry Management ─────────────────────────────────────────
  getAllEntries() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  saveEntries(entries) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
  },

  getTodayEntry() {
    const today = new Date().toISOString().split('T')[0];
    const entries = this.getAllEntries();
    return entries.find(e => e.date === today) || null;
  },

  saveEntry(entry) {
    const entries = this.getAllEntries();
    const today = new Date().toISOString().split('T')[0];
    entry.date = today;
    entry.timestamp = new Date().toISOString();

    const idx = entries.findIndex(e => e.date === today);
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], ...entry };
    } else {
      entries.push(entry);
    }

    this.saveEntries(entries);
    return entry;
  },

  // ─── Risk Detection Algorithm ─────────────────────────────────
  DANGEROUS_THOUGHTS: {
    'need to make it back': { risk: 'revenge_trading', severity: 'high' },
    'make the loss back': { risk: 'revenge_trading', severity: 'high' },
    'recover the loss': { risk: 'revenge_trading', severity: 'high' },
    'just one more': { risk: 'overtrading', severity: 'high' },
    'one more trade': { risk: 'overtrading', severity: 'high' },
    'leaving without me': { risk: 'fomo', severity: 'high' },
    'move leaving': { risk: 'fomo', severity: 'high' },
    'missing out': { risk: 'fomo', severity: 'high' },
    'missed the move': { risk: 'fomo', severity: 'high' },
    'will definitely reverse': { risk: 'overconfidence', severity: 'high' },
    'know this will': { risk: 'overconfidence', severity: 'high' },
    'i can feel': { risk: 'ego_trading', severity: 'high' },
    'obvious trade': { risk: 'overconfidence', severity: 'medium' },
    'looks obvious': { risk: 'overconfidence', severity: 'medium' },
    'easy money': { risk: 'overconfidence', severity: 'medium' },
    'cracked the code': { risk: 'overconfidence', severity: 'medium' },
    'made good money': { risk: 'cockiness', severity: 'medium' },
    'risk more': { risk: 'overconfidence', severity: 'medium' },
    'increase size': { risk: 'overconfidence', severity: 'medium' },
    'frustrated': { risk: 'emotional_carry_over', severity: 'medium' },
    'angry': { risk: 'emotional_carry_over', severity: 'medium' },
    'annoyed': { risk: 'emotional_carry_over', severity: 'medium' },
    'rushed': { risk: 'impatience', severity: 'medium' },
    'hurried': { risk: 'impatience', severity: 'medium' },
    'tired': { risk: 'reduced_cognition', severity: 'medium' },
    'exhausted': { risk: 'reduced_cognition', severity: 'medium' },
    'anxious': { risk: 'anxiety', severity: 'medium' },
    'nervous': { risk: 'anxiety', severity: 'medium' },
    'desperate': { risk: 'desperation', severity: 'high' },
    'chasing': { risk: 'fomo', severity: 'high' },
  },

  detectRisks(text) {
    const lower = text.toLowerCase();
    const detected = new Set();
    const confidence = {};

    Object.entries(this.DANGEROUS_THOUGHTS).forEach(([phrase, meta]) => {
      if (lower.includes(phrase)) {
        detected.add(meta.risk);
        confidence[meta.risk] = meta.severity;
      }
    });

    return Array.from(detected);
  },

  detectStrengths(text) {
    const lower = text.toLowerCase();
    const strengths = [];

    const positivePatterns = {
      'patient': 'Emotional patience',
      'wait for setup': 'Plan discipline',
      'follow the plan': 'Process focus',
      'stop loss': 'Risk awareness',
      'checklist': 'Pre-execution diligence',
      'calm': 'Emotional stability',
      'focused': 'Attention control',
      'protective': 'Capital preservation',
      'walk away': 'Self-regulation',
      'no revenge': 'Emotional control',
    };

    Object.entries(positivePatterns).forEach(([phrase, label]) => {
      if (lower.includes(phrase)) {
        strengths.push(label);
      }
    });

    return strengths;
  },

  // ─── Permission State Logic ───────────────────────────────────
  calculateReadinessScore(text, previousEntries = []) {
    let score = 70; // neutral baseline

    const risks = this.detectRisks(text);
    const lower = text.toLowerCase();

    // Risk penalties
    risks.forEach(risk => {
      if (['revenge_trading', 'desperation', 'chasing'].includes(risk)) {
        score -= 25;
      } else if (['fomo', 'overconfidence', 'ego_trading', 'emotional_carry_over'].includes(risk)) {
        score -= 15;
      } else {
        score -= 10;
      }
    });

    // Strength bonuses
    if (lower.includes('follow') || lower.includes('plan')) score += 10;
    if (lower.includes('patient') || lower.includes('wait')) score += 8;
    if (lower.includes('calm') || lower.includes('focused')) score += 8;
    if (lower.includes('protective') || lower.includes('capital')) score += 5;

    // Emotional state modifiers
    if (lower.includes('tired') || lower.includes('exhausted')) score -= 8;
    if (lower.includes('anxious') || lower.includes('nervous')) score -= 5;

    // Recent loss carry-over check
    if (previousEntries.length > 0) {
      const lastEntry = previousEntries[previousEntries.length - 1];
      if (lastEntry.pnl < 0 && lastEntry.emotionalCarryover) {
        score -= 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  },

  getPermissionState(score) {
    if (score >= 75) return 'GREEN';
    if (score >= 55) return 'YELLOW';
    return 'RED';
  },

  // ─── Mock Claude Response ─────────────────────────────────────
  generateMockCoachResponse(text, score, state) {
    const risks = this.detectRisks(text);
    const strengths = this.detectStrengths(text);
    const lower = text.toLowerCase();

    // State-specific messaging
    let headline, message, protocol, ifThen;

    if (state === 'GREEN') {
      headline = 'You\'re in a good headspace. Execute the plan.';
      message = 'Calm, patient, and plan-focused. This is your operating state. Trade your setups, follow your rules, and trust the process. Nothing to prove today.';
      protocol = [
        'Execute only A+ setups',
        'Follow your 2-trade limit',
        'No lower timeframe entries',
        'After loss, wait one full 30m candle',
        'Respect your daily $500 max loss hard stop'
      ];
      ifThen = 'If I feel tempted to deviate, then I step away for 5 minutes and review my rules.';
    } else if (state === 'YELLOW') {
      const riskType = risks[0] || 'mild_emotional_risk';
      headline = 'Reduced trading permission today.';
      
      if (risks.includes('fomo') || risks.includes('overconfidence')) {
        message = 'I detect urgency and risk of chasing. Trade smaller, slower, and only confirmed setups. This is not a day to prove anything.';
        protocol = [
          'Max 1 trade today',
          'Only trade with full confirmation candle',
          'Reduce position size by 25%',
          'Stricter stop loss placement',
          'Walk away after first loss'
        ];
        ifThen = 'If I feel FOMO about a move, then I let it pass and wait for the next clear setup.';
      } else if (risks.includes('emotional_carry_over') || risks.includes('revenge_trading')) {
        message = 'You\'re carrying emotion from previous results. Slow down. Focus on process, not recovery. Smaller size, fewer trades.';
        protocol = [
          'Pre-session: review your last 3 losses',
          'Max 2 trades, but expect to do 1',
          'Reduce risk per trade by $50',
          'No revenge trades — if you feel the urge, close the platform',
          'After any loss, journal immediately and reassess'
        ];
        ifThen = 'If I feel the urge to "make it back", then I close the trading app and take a 30-minute break.';
      } else if (risks.includes('reduced_cognition')) {
        message = 'You\'re tired or distracted. Trading fatigued is a losing position. Consider simulation mode or sitting out.';
        protocol = [
          'Reduce screen time to 45 minutes max',
          'Only trade 1 clear setup',
          'Increase time between trades',
          'If you miss a setup, that\'s a win',
          'Consider stepping out if fatigue increases'
        ];
        ifThen = 'If I feel my focus slipping, then I step away and come back tomorrow fresh.';
      } else {
        message = 'Mild emotional risk detected. Trade smaller, follow your checklist strictly, and prioritize process.';
        protocol = [
          'Complete pre-session checklist in full',
          'Reduce position size',
          'Trade only your primary setup',
          'No second-guessing entries',
          'Post-session journal required'
        ];
        ifThen = 'If I deviate from the plan, then I stop trading immediately and review.';
      }
    } else {
      // RED state
      headline = 'No live trading recommended today.';
      
      if (risks.includes('revenge_trading') || risks.includes('desperation')) {
        message = 'You\'re in desperation mode. This is when real money dies. Reset. Step away from live trading. Use this time to journal and study.';
        protocol = [
          'SIMULATION MODE ONLY',
          'No live capital risk',
          'Journal why you\'re feeling desperate',
          'Review your rules and last 5 trades',
          'Plan reset for tomorrow',
          'Talk to your trading buddy or coach'
        ];
        ifThen = 'If I feel compelled to trade live, then I lock the account and review the 20-Day rules.';
      } else if (risks.includes('chasing') || lower.includes('break')) {
        message = 'You\'re in a pattern of chasing and broken-plan trades. This session needs to be observation-only. Protect your capital and emotional state.';
        protocol = [
          'Watch the market, do not trade',
          'Journal patterns you observe',
          'Identify your trigger points',
          'Write down your commitment to tomorrow',
          'Review the dangerous thoughts list'
        ];
        ifThen = 'If I get the urge to trade, then I close the charts and step away from the desk completely.';
      } else {
        message = 'High emotional risk. Your best play is to step back, reflect, and reset. Come back when your system is clear.';
        protocol = [
          'No live trading today',
          'Complete a full post-session journal reflection',
          'Identify what led to this state',
          'Reset checklist for tomorrow',
          'Take a walk or do non-trading activity'
        ];
        ifThen = 'If I trade anyway, then I\'ve broken my own system and earned the consequence.';
      }
    }

    return {
      status: state,
      score: score,
      headline: headline,
      message: message,
      risks: risks,
      strengths: strengths,
      protocol: protocol,
      redFlags: risks.length > 0 ? risks.map(r => `⚠️ ${r.replace(/_/g, ' ')}`) : [],
      ifThen: ifThen
    };
  },

  parseCoachResponse(raw) {
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      console.error('Parse error:', raw);
      return null;
    }
  },

  // ─── Mock Claude API Call ─────────────────────────────────────
  async callClaude(systemPrompt, userText) {
    // Simulated API call with mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        const score = this.calculateReadinessScore(userText);
        const state = this.getPermissionState(score);
        const response = this.generateMockCoachResponse(userText, score, state);
        resolve(response);
      }, 800); // Simulate network delay
    });
  },

  hasApiKey() {
    return !!localStorage.getItem(this.API_KEY_STORAGE);
  },

  setApiKey(key) {
    if (key) {
      localStorage.setItem(this.API_KEY_STORAGE, key);
    } else {
      localStorage.removeItem(this.API_KEY_STORAGE);
    }
  },

  getApiKey() {
    return localStorage.getItem(this.API_KEY_STORAGE);
  },

  // ─── Daily Scorecard Logic ────────────────────────────────────
  calculateDailyScore(entry) {
    let score = 0;
    let autoFailReasons = [];

    // Check auto-fail conditions first
    if (entry.revengeTraded) {
      autoFailReasons.push('Revenge trade executed');
      return { score: 0, max: 10, percentage: 0, autoFail: true, reasons: autoFailReasons };
    }
    if (entry.tradedAfterDailyStop) {
      autoFailReasons.push('Traded after daily $500 stop');
      return { score: 0, max: 10, percentage: 0, autoFail: true, reasons: autoFailReasons };
    }
    if (entry.movedStopLoss) {
      autoFailReasons.push('Moved stop loss further away');
      return { score: 0, max: 10, percentage: 0, autoFail: true, reasons: autoFailReasons };
    }
    if (entry.lowerTimeframeEntry) {
      autoFailReasons.push('Used lower timeframe entry');
      return { score: 0, max: 10, percentage: 0, autoFail: true, reasons: autoFailReasons };
    }
    if (entry.brokenPlanTrade) {
      return { score: 0, max: 10, percentage: 0, autoFail: true, reasons: ['Broken-plan trade executed'] };
    }

    // Calculate points (only if no auto-fail)
    if (entry.preSessionChecklist) score += 1;
    if (entry.onlyPlannedSetup) score += 2;
    if (entry.correctTimeframe) score += 1;
    if (entry.riskRespected) score += 2;
    if (entry.tradeLimitRespected) score += 1;
    if (entry.lossProtocolFollowed) score += 1;
    if (entry.noRevengeOrFomo) score += 1;
    if (entry.postSessionJournal) score += 1;

    // Check for green P&L but broken plan
    if (entry.pnl > 0 && entry.brokenPlanTrade) {
      autoFailReasons.push('Green P&L but broke the plan — still counts as failed day');
    }

    return {
      score: score,
      max: 10,
      percentage: Math.round((score / 10) * 100),
      autoFail: false,
      reasons: autoFailReasons
    };
  },

  // ─── Dashboard Statistics ─────────────────────────────────────
  getDashStats() {
    const entries = this.getAllEntries();
    if (!entries.length) {
      return {
        totalEntries: 0,
        avgScore: '--',
        streak: 0,
        adherencePct: 0,
        stability: 0,
        calibration: 0
      };
    }

    // Average AI readiness score from last 14 entries
    const recent14 = entries.slice(-14);
    const avgScore = Math.round(recent14.reduce((sum, e) => sum + (e.aiScore || 0), 0) / recent14.length);

    // Discipline streak (consecutive days with entry)
    let streak = 0;
    let checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (entries.some(e => e.date === dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Adherence: % of days with score >= 7/10
    const adherence = entries.filter(e => {
      const calc = this.calculateDailyScore(e);
      return calc.score >= 7;
    }).length / entries.length;

    // Stability: % of days without revenge/FOMO trades
    const stability = entries.filter(e => e.noRevengeOrFomo).length / entries.length;

    // Calibration: % of days where AI score was within expected range
    const calibration = entries.filter(e => {
      const score = e.aiScore || 0;
      return (e.aiStatus === 'GREEN' && score >= 75) ||
             (e.aiStatus === 'YELLOW' && score >= 55 && score < 75) ||
             (e.aiStatus === 'RED' && score < 55);
    }).length / entries.length;

    return {
      totalEntries: entries.length,
      avgScore: avgScore,
      streak: streak,
      adherencePct: Math.round(adherence * 100),
      stability: Math.round(stability * 100),
      calibration: Math.round(calibration * 100)
    };
  },

  // ─── Heatmap Data (28 days) ───────────────────────────────────
  getHeatmapData() {
    const entries = this.getAllEntries();
    const data = [];
    let date = new Date();

    for (let i = 0; i < 28; i++) {
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateStr);

      let cls = '';
      if (entry) {
        const calc = this.calculateDailyScore(entry);
        if (calc.autoFail || calc.score === 0) {
          cls = 'r'; // Red
        } else if (calc.score >= 7) {
          cls = 'g'; // Green
        } else {
          cls = 'y'; // Yellow
        }
      }

      data.unshift({ date: dateStr, cls: cls });
      date.setDate(date.getDate() - 1);
    }

    return data;
  },

  // ─── Utility Functions ─────────────────────────────────────────
  statusLabel(status) {
    const icons = {
      GREEN: '🟢 GREEN — Normal Trading',
      YELLOW: '🟡 YELLOW — Reduced Permission',
      RED: '🔴 RED — No Live Trading'
    };
    return icons[status] || status;
  },

  statusClass(status) {
    const classes = {
      GREEN: 'green',
      YELLOW: 'yellow',
      RED: 'red'
    };
    return classes[status] || 'yellow';
  },

  toast(message, type = 'info') {
    const bgColor = {
      ok: '#39d98a',
      err: '#ff647c',
      info: '#00f0ff'
    }[type] || '#00f0ff';

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 14px 18px;
      border-radius: 12px;
      background: ${bgColor}20;
      border: 1px solid ${bgColor}50;
      color: ${bgColor};
      font-size: 14px;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // ─── Google Sheets Export/Import ──────────────────────────────
  exportAllToCSV() {
    const entries = this.getAllEntries();
    if (!entries.length) {
      this.toast('No entries to export', 'info');
      return;
    }

    const headers = [
      'Date', 'AI Score', 'AI Status', 'Daily Score', 'P&L', 'Trades',
      'Pre-Checklist', 'Plan Adherence', 'Risk Respected', 'Revenge/FOMO',
      'Post-Journal', 'Feeling', 'Mind', 'Emotion', 'Intention'
    ];

    const rows = entries.map(e => {
      const calc = this.calculateDailyScore(e);
      return [
        e.date,
        e.aiScore || '--',
        e.aiStatus || '--',
        calc.score + '/' + calc.max,
        e.pnl || '--',
        e.tradesExecuted || '--',
        e.preSessionChecklist ? 'Yes' : 'No',
        e.onlyPlannedSetup ? 'Yes' : 'No',
        e.riskRespected ? 'Yes' : 'No',
        e.noRevengeOrFomo ? 'Yes' : 'No',
        e.postSessionJournal ? 'Yes' : 'No',
        e.feeling || '',
        e.mind || '',
        e.emotion || '',
        e.intention || ''
      ];
    });

    const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MindTrade_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.toast('✓ Exported to CSV. Upload to Google Sheets now.', 'ok');
  },

  importFromCSV(csvText) {
    // Parse CSV and update entries
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      this.toast('Invalid CSV format', 'err');
      return;
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const entries = this.getAllEntries();

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      if (values.length < 3) continue;

      const date = values[0];
      const existing = entries.find(e => e.date === date);

      const data = {
        date,
        aiScore: values[1] !== '--' ? parseInt(values[1]) : null,
        aiStatus: values[2] !== '--' ? values[2] : null,
        pnl: values[4] !== '--' ? parseFloat(values[4]) : null,
        tradesExecuted: values[5] !== '--' ? parseInt(values[5]) : null,
        preSessionChecklist: values[6] === 'Yes',
        onlyPlannedSetup: values[7] === 'Yes',
        riskRespected: values[8] === 'Yes',
        noRevengeOrFomo: values[9] === 'Yes',
        postSessionJournal: values[10] === 'Yes',
        feeling: values[11] || '',
        mind: values[12] || '',
        emotion: values[13] || '',
        intention: values[14] || ''
      };

      if (existing) {
        Object.assign(existing, data);
      } else {
        entries.push(data);
      }
    }

    this.saveEntries(entries);
    this.toast('✓ Imported from CSV', 'ok');
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => MT.init());
