# MindTrade OS — Google Sheets Integration Guide

## Overview

This guide walks you through setting up a Google Sheet to store, sync, and backup your MindTrade journaling data. Your data lives in localStorage on your browser, but this sheet is your permanent audit trail and backup.

**Setup time: 5 minutes**

---

## Step 1: Create a New Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **Blank Spreadsheet**
3. Name it: `MindTrade Trading Journal`

---

## Step 2: Set Up Tabs/Sheets

Your spreadsheet should have THREE sheets (tabs at the bottom):

### Sheet 1: "Entries" (Main Data)
This is your daily trading log. Headers should be:

```
A: Date
B: AI Score (0-100)
C: AI Status (GREEN/YELLOW/RED)
D: Daily Score (0-10)
E: P&L
F: Trades Executed
G: Pre-Checklist (Yes/No)
H: Only Planned (Yes/No)
I: Risk Respected (Yes/No)
J: Revenge/FOMO (Yes/No)
K: Post-Journal (Yes/No)
L: Feeling
M: Mind
N: Emotion
O: Intention
P: Well Done
Q: Improve
R: Tomorrow Focus
S: Auto-Fail Reason
T: Timestamp
```

The first row should have these headers. Leave rows 2+ blank for data to populate.

### Sheet 2: "Dashboard"
Summary statistics. This can include:
- Total entries
- Average AI score
- Discipline streak
- Success rate (8+ score %)
- Red days count
- Best week

### Sheet 3: "Methodology"
Reference documentation (optional). Copy the rules from the Methodology page as backup.

---

## Step 3: Set Up Apps Script for Auto-Sync

### Open Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code
3. Copy and paste the code below

```javascript
// ═══════════════════════════════════════════════════════════════
// MindTrade OS — Google Sheets Apps Script
// Syncs data between localStorage web app and Google Sheets
// ═══════════════════════════════════════════════════════════════

// Configuration
const SHEET_NAME = 'Entries';
const HEADER_ROW = 1;

// ─── Sync Web Data to Sheet ──────────────────────────────────

/**
 * Call this function to import CSV data exported from the web app
 * Paste the CSV content into the first parameter
 */
function importCSVData(csvData) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lines = csvData.trim().split('\n');
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    if (values.length < 3) continue;
    
    const date = values[0];
    const range = sheet.getRange(i + 1, 1, 1, values.length);
    range.setValues([values]);
  }
  
  SpreadsheetApp.getUi().alert('✓ CSV data imported successfully');
}

/**
 * Export data from Google Sheet as CSV for backup
 */
function exportSheetAsCSV() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  let csv = '';
  for (let row of data) {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  }
  
  const blob = Utilities.newBlob(csv, 'text/csv', `MindTrade_Backup_${new Date().toISOString().split('T')[0]}.csv`);
  DriveApp.createFile(blob);
  
  SpreadsheetApp.getUi().alert('✓ Sheet exported to Drive as CSV');
}

/**
 * Create a chart of AI Scores over time
 */
function createScoreChart() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(sheet.getRange('A1:B50'))
    .setPosition(5, 8, 0, 0)
    .setTitle('AI Readiness Score Trend')
    .build();
  
  sheet.insertChart(chart);
}

/**
 * Calculate daily statistics
 */
function calculateStats() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  let totalEntries = 0;
  let sumScores = 0;
  let greenDays = 0;
  let yellowDays = 0;
  let redDays = 0;
  
  for (let i = 1; i < data.length; i++) {
    const status = data[i][2]; // Column C (AI Status)
    const score = parseFloat(data[i][1]); // Column B (AI Score)
    
    if (status) totalEntries++;
    if (status === 'GREEN') greenDays++;
    if (status === 'YELLOW') yellowDays++;
    if (status === 'RED') redDays++;
    if (!isNaN(score)) sumScores += score;
  }
  
  const avgScore = totalEntries > 0 ? (sumScores / totalEntries).toFixed(1) : 0;
  
  Logger.log(`Total Entries: ${totalEntries}`);
  Logger.log(`Average Score: ${avgScore}/100`);
  Logger.log(`Green Days: ${greenDays}`);
  Logger.log(`Yellow Days: ${yellowDays}`);
  Logger.log(`Red Days: ${redDays}`);
}

/**
 * Add conditional formatting to the sheet
 */
function applyFormatting() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Format Status column (C) with colors
  const statusRange = sheet.getRange('C2:C1000');
  const rule1 = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=C2="GREEN"')
    .setBackground('#39d98a')
    .setFontColor('#fff')
    .build();
  const rule2 = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=C2="YELLOW"')
    .setBackground('#ffb347')
    .setFontColor('#fff')
    .build();
  const rule3 = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=C2="RED"')
    .setBackground('#ff647c')
    .setFontColor('#fff')
    .build();
  
  sheet.setConditionalFormatRules([rule1, rule2, rule3]);
  
  // Format Daily Score column (D) with background colors
  const scoreRange = sheet.getRange('D2:D1000');
  const scoreRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThanOrEqualTo(8)
    .setBackground('#39d98a')
    .build();
  
  sheet.setConditionalFormatRules([rule1, rule2, rule3, scoreRule]);
}

/**
 * Generate a simple leaderboard if multiple traders
 * (Optional for group challenges)
 */
function generateLeaderboard() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  let entries = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // Date exists
      const dailyScore = parseFloat(data[i][3]); // Column D
      entries.push({
        date: data[i][0],
        score: dailyScore || 0
      });
    }
  }
  
  const avgScore = entries.length > 0 
    ? (entries.reduce((sum, e) => sum + e.score, 0) / entries.length).toFixed(1)
    : 0;
  
  Logger.log(`Leaderboard Stats: ${avgScore}/10 average`);
}
```

### Deploy the Script

1. Click **Save** (Ctrl+S)
2. Give it a project name (e.g., "MindTrade Sync")
3. Click **Deploy → New Deployment**
4. Select **Deployment type → Web app**
5. Execute as: Your account
6. Who has access: Anyone
7. Click **Deploy**

---

## Step 4: Connect Your Web App to Google Sheets

The web app stores data locally. To sync with Google Sheets:

### Option A: Manual CSV Export/Import (Easiest)

**Every 1-2 weeks:**

1. Go to your MindTrade dashboard
2. Click **⬇ Export All to Sheets**
3. A CSV file downloads
4. Open your Google Sheet
5. Select all data in the CSV
6. Paste into your Google Sheet

### Option B: Automate with Google Forms (Advanced)

1. Create a Google Form that mirrors your daily journal questions
2. Responses automatically populate a Google Sheet
3. Sync that with your MindTrade app

*This is more complex, so start with Option A.*

---

## Step 5: Track Your Stats in the Sheet

### Create a Summary Tab

In your "Dashboard" sheet, create simple formulas:

```
A1: Total Entries
B1: =COUNTA(Entries!A2:A1000)

A2: Average AI Score
B2: =AVERAGE(Entries!B2:B1000)

A3: Green Days
B3: =COUNTIF(Entries!C2:C1000,"GREEN")

A4: Yellow Days
B4: =COUNTIF(Entries!C2:C1000,"YELLOW")

A5: Red Days
B5: =COUNTIF(Entries!C2:C1000,"RED")

A6: Discipline Score >= 8
B6: =COUNTIF(Entries!D2:D1000,">=8")

A7: Success Rate
B7: =B6/B1*100&"%"
```

These formulas auto-update as you add entries.

---

## Step 6: Optional — Create a Chart

In the Google Sheet:

1. Select your Date column (A) and AI Score column (B)
2. Go to **Insert → Chart**
3. Choose **Line Chart**
4. Add title: "AI Readiness Score Over Time"
5. This visualizes your emotional stability trend

---

## How It Works

### Data Flow:

1. **You trade & journal** in the web app (MindTrade dashboard)
2. **Data saves locally** in your browser's localStorage
3. **You export to CSV** when you want to backup (click button on dashboard)
4. **CSV goes to Google Sheets** (paste into Entries sheet)
5. **Your dashboard formulas update** automatically
6. **You can view trends** via charts and summary stats

### Backup Strategy:

- **Weekly:** Export to Google Sheets
- **Monthly:** Download the Google Sheet as Excel backup
- **Quarterly:** Share the sheet with your coach/mentor for review

---

## Troubleshooting

**Q: My data isn't appearing in the sheet**
A: Check that you're pasting into the right sheet ("Entries") and that headers match.

**Q: Can I edit the sheet directly and sync back?**
A: Yes, but be careful about date formatting. Keep dates as YYYY-MM-DD (e.g., 2024-03-15).

**Q: How do I share this with my trading buddy?**
A: Click the blue **Share** button in Google Sheets. Give them view or edit access.

**Q: Can I use this with multiple traders?**
A: Yes. Create separate sheets for each trader or add a "Trader Name" column.

---

## Next Steps

1. Set up your Google Sheet with the tabs above
2. Run your first week of journaling in the web app
3. Export to CSV after 5-7 entries
4. Paste into your Google Sheet
5. Set up the summary formulas
6. Review your stats weekly

Your Google Sheet is now your permanent trading psychology record. This data is valuable for spotting patterns and improving your discipline over time.

---

## Questions?

Refer back to the MindTrade Methodology page for clarification on any rules or scoring logic.
