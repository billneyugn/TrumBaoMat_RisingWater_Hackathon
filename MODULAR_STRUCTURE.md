# 📦 Modular JavaScript Structure

## Overview

The game JavaScript has been refactored from a single `script.js` file into **3 modular files** for better organization, maintainability, and reusability.

---

## 📋 File Breakdown

### **1. helpers.js** - Utilities & Helper Functions
**Purpose:** Low-level utilities with no dependencies

**Functions:**
- `i18n(key, fallback)` - Language/localization helper
- `shuffleArray(array)` - Shuffle array (Fisher-Yates)
- `clamp(value, min, max)` - Clamp value between min/max
- `roundValue(value)` - Round to nearest integer
- `formatPercent(value)` - Format as percentage
- `getRandomElement(array)` - Get random array element
- `checkWinCondition(safety, infrastructure)` - Validate win state
- `getPlayerRank(safety, infrastructure)` - Calculate player rank
- `updateI18nText()` - Update all i18n elements

**Dependencies:** None (pure utilities)

**Use Case:** Used by both main.js and ui.js

---

### **2. main.js** - Game Loop & Core Logic
**Purpose:** Game state management and core gameplay mechanics

**Key Components:**
- `gameState` object - Global game state (shared across modules)
- `DOMContentLoaded` event - Initialize on page load
- `initializeGame()` - Set up initial state
- `setupEventListeners()` - Attach all event listeners
- `drawNextEvent()` - Draw random event
- `executeAction(action)` - Apply action to metrics
- `processNextRound()` - Move to next round
- `showQuiz()` - Display quiz modal (SweetAlert2)
- `checkQuizAnswer(selectedIndex, correctIndex)` - Validate quiz
- `endGame()` - Determine winner and show summary
- `replayGame()` - Reset and restart

**Dependencies:** 
- Requires `helpers.js` for utility functions
- Requires SweetAlert2 CDN for quiz/summary modals

**Use Case:** Core gameplay loop, event management, quiz logic

---

### **3. ui.js** - Rendering & Display
**Purpose:** All visual rendering and DOM manipulation

**Functions:**
- `renderUI()` - Render all UI elements
- `updateMeters()` - Update meter displays
- `updateRoundDisplay()` - Update round counter
- `renderActions()` - Render action buttons
- `displayEvent()` - Display event card
- `showTip()` - Show flood safety tip
- `openModal(modalId)` - Open modal dialog
- `closeModal(modalId)` - Close modal dialog
- Modal click handler - Close on outside click

**Dependencies:**
- Requires `helpers.js` for formatting functions
- Requires `main.js` for `gameState`

**Use Case:** All visual updates and animations

---

## 🔄 Dependency Chain

```
helpers.js (No dependencies)
    ↓
    ├→ main.js (Depends on helpers)
    │   └→ Uses: i18n, shuffleArray, clamp, roundValue, etc.
    │
    └→ ui.js (Depends on helpers + main)
        ├→ Uses: roundValue, clamp from helpers
        └→ Uses: gameState from main
```

---

## 📥 Script Import Order in index.html

**CRITICAL:** Scripts must be imported in correct dependency order:

```html
<!-- 1. Helpers first (no dependencies) -->
<script src="./helpers.js"></script>

<!-- 2. Main second (depends on helpers) -->
<script src="./main.js"></script>

<!-- 3. UI last (depends on helpers and main) -->
<script src="./ui.js"></script>
```

**Why this order?**
- `helpers.js` defines base utilities
- `main.js` defines `gameState` and game logic (needs helpers)
- `ui.js` updates UI (needs both helpers and main's gameState)

---

## 🔧 How to Extend

### Adding a New Utility Function
**File:** `helpers.js`
```javascript
// Add to helpers.js
function myNewUtility(param) {
  // implementation
}

// Use from any other file
const result = myNewUtility(value);
```

### Adding New Game Logic
**File:** `main.js`
```javascript
// Add to main.js
function myNewGameFunction() {
  gameState.currentRound++; // Can access gameState
  updateMeters(); // Can call ui.js functions
}
```

### Adding New UI Element
**File:** `ui.js`
```javascript
// Add to ui.js
function renderNewElement() {
  const element = document.getElementById('myElement');
  element.textContent = gameState.currentRound; // Access gameState
}
```

---

## 📊 Module Responsibilities

| Module | Type | Size | Responsibility |
|--------|------|------|-----------------|
| **helpers.js** | Utility | ~100 lines | Math, language, validation |
| **main.js** | Core | ~400 lines | Game loop, events, quiz, logic |
| **ui.js** | Display | ~100 lines | Rendering, DOM updates |
| **Total** | - | ~600 lines | Complete game logic |

---

## ✅ Benefits of Modular Structure

✅ **Separation of Concerns** - Each file has single responsibility  
✅ **Easier Maintenance** - Find and fix issues faster  
✅ **Code Reusability** - Utilities can be used by multiple modules  
✅ **Scalability** - Easy to add features without cluttering existing files  
✅ **Testing** - Each module can be tested independently  
✅ **Collaboration** - Multiple developers can work on different modules  
✅ **Readability** - Smaller files are easier to understand  

---

## 🎮 Game Flow with Modular Architecture

```
1. index.html loads scripts (in order: helpers → main → ui)
2. main.js detects DOMContentLoaded
3. main.js loads gameData.json
4. main.js calls initializeGame() (uses helpers utilities)
5. main.js calls setupEventListeners()
6. main.js calls renderUI() (which is in ui.js)
7. ui.js calls updateMeters(), renderActions() (uses helpers)
8. main.js draws first event
9. User clicks action → main.js executeAction()
10. main.js calls updateMeters() → ui.js updates display
... Game loop continues ...
```

---

## 🐛 Troubleshooting

**Problem:** "gameState is not defined"
- **Cause:** ui.js or other file loaded before main.js
- **Solution:** Check script import order in index.html

**Problem:** "i18n is not a function"
- **Cause:** helpers.js not loaded first
- **Solution:** Ensure helpers.js is first script tag

**Problem:** "updateMeters is not a function"
- **Cause:** ui.js loaded before being needed
- **Solution:** Verify correct import order

---

## 📋 File Checklist

- ✅ helpers.js created
- ✅ main.js created  
- ✅ ui.js created
- ✅ index.html updated with script imports
- ✅ Original script.js still available (for reference)
- ✅ All imports in correct dependency order
- ✅ No circular dependencies
- ✅ Modular functions properly scoped
- ✅ Global gameState accessible to all modules

---

## 🚀 How to Use

Simply load `index.html` as usual. The modular scripts will load in the correct order automatically.

```bash
python -m http.server 8000
# Visit http://localhost:8000/index.html
```

The game works exactly the same, but now the code is better organized and easier to maintain! 🌊💪

---

## 📝 Summary

The monolithic `script.js` (567 lines) has been split into:
- **helpers.js** - Pure utilities (~100 lines)
- **main.js** - Game logic (~400 lines)
- **ui.js** - Display/rendering (~100 lines)

This modular approach makes the codebase cleaner, more maintainable, and easier to extend! 🎮✨

