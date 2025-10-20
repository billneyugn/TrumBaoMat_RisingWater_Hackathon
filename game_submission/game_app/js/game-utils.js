// ====================================
// HELPERS.JS - Utilities & Helpers
// ====================================

/**
 * Language/Localization Helper
 * Gets translated text from gameData
 */
function i18n(key, fallback = key) {
  if (!gameState.gameData) return fallback;
  const langData = gameState.gameData.i18n[gameState.currentLanguage];
  return langData && langData[key] ? langData[key] : fallback;
}

/**
 * Shuffles an array (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

/**
 * Clamps a value between min and max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Rounds a number to nearest integer
 */
function roundValue(value) {
  return Math.round(value);
}

/**
 * Formats a number as percentage
 */
function formatPercent(value) {
  return `${roundValue(clamp(value, 0, 100))}%`;
}

/**
 * Gets random element from array
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Checks if condition passes (for win/lose logic)
 */
function checkWinCondition(safety, infrastructure) {
  if (!gameState.gameData) return false;
  const winCond = gameState.gameData.winCondition;
  return safety >= winCond.minSafety && infrastructure >= winCond.minInfrastructure;
}

/**
 * Gets player ranking based on metrics
 */
function getPlayerRank(safety, infrastructure) {
  const lang = gameState.currentLanguage;
  
  if (safety >= 70 && infrastructure >= 70) {
    return {
      rank: lang === 'en' ? '🏆 Resilient Survivor' : '🏆 Cộng Đồng Bình Yên',
      color: '#27ae60',
      icon: '🌟'
    };
  } else if (safety >= 50 && infrastructure >= 50) {
    return {
      rank: lang === 'en' ? '📚 Adaptive Learner' : '📚 Nhà Lãnh Đạo Khôn Ngoan',
      color: '#f39c12',
      icon: '📈'
    };
  } else {
    return {
      rank: lang === 'en' ? '⚠️ Unprepared' : '⚠️ Chưa Chuẩn Bị',
      color: '#e74c3c',
      icon: '❌'
    };
  }
}

/**
 * Updates i18n text on all elements with data-i18n attribute
 */
function updateI18nText() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = i18n(key, el.textContent);
  });

  // Update help text
  const helpEl = document.getElementById('helpText');
  if (helpEl) {
    const lang = gameState.currentLanguage;
    helpEl.innerHTML = gameState.gameData.helpText[lang];
  }
}
