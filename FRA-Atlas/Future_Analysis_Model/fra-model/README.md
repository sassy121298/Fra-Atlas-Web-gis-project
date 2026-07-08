# FRA What-If Analysis Model — DSS

A **Decision Support System** for Forest Rights Act (FRA) 2006 implementation analysis across 19 districts in **Madhya Pradesh, Tripura, Odisha, and Telangana**.

---

## 🚀 Quick Start

### Option A — Open directly in browser
Just open `index.html` in any modern browser. No build step required.

> ⚠️ If the browser blocks ES module imports from `file://`, use Option B.

### Option B — Local dev server (recommended)

```bash
# Node.js (npx)
npx serve .

# Python 3
python3 -m http.server 8080

# Then open: http://localhost:8080
```

---

## 📁 Project Structure

```
fra-model/
├── index.html                   ← Main entry point
├── README.md
└── src/
    ├── app.js                   ← App controller & UI logic
    ├── data/
    │   └── districts.js         ← District database + presets
    ├── utils/
    │   └── model.js             ← Model engine (scoring, deltas, insights)
    └── styles/
        └── main.css             ← Full design system
```

---

## 🔧 Four Analytical Tabs

### 1. Scenario Builder
- Select any of 19 districts across 4 states
- Adjust 5 key drivers via sliders:
  - Forest Cover (%)
  - Tribal Population Density (%)
  - Claims Pending (%)
  - Encroachment Rate (%)
  - Gram Sabha Activity (%)
- Instant prediction: FRA Approval Rate, Risk Index, Priority, Projected Annual Approvals
- Delta vs baseline shown on every metric
- Quick scenario presets (Deforestation, Tribal Influx, Claims Backlog, Encroachment Surge, Optimal)

### 2. Baseline vs What-If
- Side-by-side table: original district values vs your modified scenario
- Impact direction shown per variable (▲ Positive / ▼ Negative)
- Output deltas: approval rate pp change, risk index shift, annual approval gain/loss
- Ask Claude for policy recommendations

### 3. District Heatmap
- All 19 districts ranked and sortable by any column
- Risk bar visualisation (red → amber → green)
- Approval rate bar per district
- Priority flags (High / Medium / Low)

### 4. Insights
- Context-aware interpretive statements for your current scenario
- Model weight structure visualised
- Model formula explained (FC, TD, CP, ER, GS variables)
- Ask Claude for an intervention plan

---

## ⚙️ Model Engine

### Approval Rate Formula
```
Score = ForestCover×0.35 + TribalDensity×0.20
      + (1−ClaimsPending)×0.15 + (1−EncroachmentRate)×0.15
      + GramSabhaActivity×0.15

ApprovalRate = 15% + Score × 75%
```

### Risk Index Formula
```
RiskIndex = EncroachmentRate×0.35 + (1−ForestCover)×0.30
           + ClaimsPending×0.20 + (1−GramSabhaActivity)×0.15
```

### Priority Classification
- **High Priority**: ApprovalRate < 40% OR RiskIndex > 65
- **Medium Priority**: ApprovalRate < 60% OR RiskIndex > 45
- **Low Priority**: otherwise

### Weights (calibrated to FRA literature)
| Driver | Weight | Direction |
|---|---|---|
| Forest Cover | 35% | Higher = better |
| Tribal Density | 20% | Higher = better |
| Claims Pending | 15% | Lower = better |
| Encroachment Rate | 15% | Lower = better |
| Gram Sabha Activity | 15% | Higher = better |

---

## 🤖 AI Integration

The **Ask Claude** buttons call the Anthropic API (`claude-sonnet-4-6`) with your full scenario context to generate:
- Contextual policy recommendations
- Intervention plans referencing FRA 2006 sections
- PESA-aligned strategies

No API key is needed when run via Claude's Artifact environment.

---

## 📊 Districts Covered

| State | Districts |
|---|---|
| Madhya Pradesh | Mandla, Balaghat, Dindori, Seoni, Chhindwara |
| Tripura | West Tripura, Dhalai, North Tripura, South Tripura, Gomati |
| Odisha | Koraput, Rayagada, Sundargarh, Mayurbhanj |
| Telangana | Khammam, Adilabad, Bhadradri Kothagudem, Mulugu, Jayashankar Bhupalpally |

---

## 🛠️ Tech Stack
- **Vanilla JS** (ES Modules, no build step)
- **CSS Custom Properties** for theming
- **Google Fonts**: Playfair Display + Inter + JetBrains Mono
- **Anthropic API** for AI policy analysis
