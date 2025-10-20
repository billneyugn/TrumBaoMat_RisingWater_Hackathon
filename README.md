# 🌊 Rising Waters: Solo Survival (Vietnam Edition)

An educational, single-player web-based board game teaching flood preparedness and resilience in Vietnam.

## 🎮 Game Overview

**Purpose:** Educate Vietnamese communities on flood preparedness, survival, and recovery through strategic gameplay.

**Duration:** 8 rounds (~10 minutes per session)

**Your Role:** Community Leader managing a small town during flood season.

### Core Mechanics

- **Draw Event** → **Choose Action** → **See Outcome** → **Learn Flood Safety Tip**
- Each round, a randomized flood-related event challenges your leadership
- Your strategic choices affect four key metrics: **Safety**, **Infrastructure**, **Morale**, and **Resource Points (RP)**
- Answer **safety quizzes** correctly to earn bonus +2 RP

### Win Condition

At the end of 8 rounds, you succeed if:
- **Safety ≥ 70%** AND
- **Infrastructure ≥ 60%**

Otherwise, the community struggles through the flood season.

---

## 📊 Game Metrics Explained

| Metric | Purpose | Tips |
|--------|---------|------|
| **Safety** | Protects citizens from harm during floods. **CRITICAL!** | Use "Evacuate Citizens", "Establish Evacuation Centers", "Organize Rescue Teams" |
| **Infrastructure** | Maintains dikes, roads, buildings for recovery | Reinforce before floods hit; repair roads for supply delivery |
| **Morale** | Community confidence and cooperation. Low morale reduces action effectiveness | Distribute aid, provide medical support, organize awareness campaigns |
| **Resource Points (RP)** | Budget for disaster relief. Must spend wisely! | Costs range 10–25 RP per action. Quiz bonuses: +2 RP |

---

## 🎯 Strategic Approaches

### **Prepare Strategy** (Proactive)
Invest early in safety and infrastructure before floods hit.
- **Best Actions:** "Reinforce Dikes", "Community Awareness Campaign"
- **Cost:** 10–20 RP per round
- **Risk:** Moderate; requires forward-thinking

### **Defend Strategy** (Reactive)
React quickly when floods strike, focusing on immediate damage control.
- **Best Actions:** "Evacuate Citizens", "Establish Evacuation Centers", "Organize Rescue Teams"
- **Cost:** 15–25 RP per reaction
- **Risk:** High; reacting to crisis is expensive

### **Recover Strategy** (Adaptive)
Balance between rebuilding infrastructure and maintaining morale after floods.
- **Best Actions:** "Repair Roads", "Distribute Relief Supplies", "Provide Medical Support"
- **Cost:** 15–22 RP per recovery action
- **Risk:** Lower, but requires active management

---

## 📋 Available Actions

| Action | Cost | Best For | Effects |
|--------|------|----------|---------|
| **Reinforce Dikes** | 20 RP | Prepare | +10 Safety, +15 Infrastructure |
| **Evacuate Citizens** | 15 RP | Defend | +20 Safety, -5 Infrastructure, -5 Morale |
| **Distribute Relief Supplies** | 15 RP | Recover | +5 Safety, +15 Morale |
| **Repair Roads** | 18 RP | Recover | +8 Safety, +18 Infrastructure, +8 Morale |
| **Establish Evacuation Centers** | 25 RP | Defend | +25 Safety, +8 Infrastructure, +12 Morale |
| **Organize Rescue Teams** | 20 RP | Defend | +18 Safety, -8 Infrastructure, +10 Morale |
| **Community Awareness Campaign** | 10 RP | Prepare | +12 Safety, +3 Infrastructure, +10 Morale |
| **Provide Medical Support** | 22 RP | Recover | +15 Safety, +5 Infrastructure, +12 Morale |
| **Do Nothing** | 0 RP | Emergency | -8 Safety, -5 Infrastructure, -10 Morale |

---

## 🧠 Learning Features

### Event Cards
8 realistic flood scenarios based on Vietnam's geography and climate:
1. Heavy Rainfall Warning
2. Dike Breach Reported
3. Water Levels Rising Rapidly
4. Disease Outbreak Risk (post-flood)
5. Thousands of Evacuees Arriving
6. Rescue Operation Required
7. Water Levels Receding
8. Clear Weather Period

### Safety Quizzes
After certain actions, a **1-question quiz** may appear.
- **Reward:** +2 RP for correct answer
- **Topics:** Evacuation planning, water treatment, rescue techniques, disease prevention
- **Bilingual:** English & Vietnamese

### Flood Safety Tips
Every action reveals a **practical flood preparedness tip** from Vietnamese disaster management best practices.

---

## 🌐 Language Support

- **English (EN)** - Full localization
- **Vietnamese (VI)** - Complete translation of all game content

Switch languages anytime using the **Language Switcher** in the top-right corner.

---

## 🚀 Getting Started

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No internet required (play offline)
- No plugins or frameworks needed

### Setup

1. **Download Files:**
   - `index.html`
   - `style.css`
   - `script.js`
   - `gameData.json`

2. **Open the Game:**
   - Double-click `index.html`, or
   - Serve locally: `python -m http.server 8000` (then visit `http://localhost:8000`)

3. **Start Playing:**
   - Read the Help section to learn the rules
   - Switch to Vietnamese if desired
   - Choose your first action and begin!

---

## 💾 Technical Details

### Technology Stack
- **HTML5** - Semantic structure
- **CSS3** - Modern grid layout, animations, responsive design
- **Vanilla JavaScript** - No frameworks, 100% front-end
- **JSON** - Game data and localization

### File Structure
```
floodgame/
├── index.html           # Main HTML structure
├── style.css            # Complete styling + responsiveness
├── script.js            # Game logic, event handling, UI updates
├── gameData.json        # Events, actions, quizzes, translations
└── README.md            # This file
```

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📱 Responsive Design

The game works on:
- **Desktop** (1024px+) - Full two-column layout
- **Tablet** (768px–1024px) - Single column, optimized layout
- **Mobile** (320px–768px) - Touch-friendly buttons, compact meters

---

## 🎓 Educational Value

This game teaches:

✅ **Flood Preparedness:**
- Evacuation planning and execution
- Early warning response
- Dike maintenance and reinforcement

✅ **Resilience & Recovery:**
- Resource allocation under pressure
- Community morale maintenance
- Infrastructure restoration priorities

✅ **Decision-Making:**
- Trade-offs between strategies
- Long-term vs. short-term planning
- Risk management with limited budgets

✅ **Cultural Context:**
- Vietnam-specific flood scenarios (Mekong Delta, Red River, typhoon-prone regions)
- Local disaster management practices
- Community-centered leadership principles

---

## 🔄 Replayability

- **Randomized Events:** Event order shuffles each game
- **Multiple Strategies:** Prepare/Defend/Recover paths lead to different outcomes
- **Variable Outcomes:** Same events can have different results based on prior actions
- **Quick Sessions:** 8 rounds ≈ 10 minutes per game

---

## 🐛 Troubleshooting

**Game won't load?**
- Ensure all 4 files (`index.html`, `style.css`, `script.js`, `gameData.json`) are in the same folder
- Check browser console (F12) for errors
- Try a different browser

**Language switch not working?**
- Refresh the page and try again
- Check that `gameData.json` loaded successfully

**Quiz not appearing?**
- Quizzes have a 30% chance per round. Keep playing!

**Metrics stuck at wrong values?**
- Refresh the page. The game state should reset.

---

## 📖 How to Extend the Game

**Add More Events:**
Edit `gameData.json` → Add event objects to the `events` array with:
- Icon, title, description
- Effects on each metric
- Tip (flood safety advice)
- Quiz question + options + correct answer

**Add More Actions:**
Edit `gameData.json` → Add action objects to the `actions` array with:
- Title, description, cost
- Effects on metrics
- Category (prepare/defend/recover/risky)

**Change Win Conditions:**
Edit `gameData.json` → Modify `winCondition` thresholds (e.g., Safety ≥ 75)

**Add More Languages:**
Edit `gameData.json` → Add language keys to `i18n` (e.g., "es" for Spanish)

---

## 📄 License & Credits

**Educational Game** - Community Leadership Edition  
Designed for Vietnamese flood-resilience education.

Uses culturally accurate scenarios and flood-preparedness advice based on:
- Vietnamese Ministry of Natural Resources & Environment guidelines
- Red Cross flood safety protocols
- ASEAN Disaster Management guidelines

---

## 🎮 Enjoy the Game!

Test your leadership skills. Learn real flood safety. **Replay and improve your strategy.**

**Good luck, Community Leader!** 🌊💪

---

**Questions or Feedback?**
- Check the Help menu in-game
- Review the game mechanics guide above
- Restart to try a new strategy
