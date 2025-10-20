// ====================================
// MAIN.JS - Game Loop & Core Logic
// ====================================

/**
 * Global Game State
 * Shared across all modules
 */
let gameState = {
  currentLanguage: 'en',
  gameData: null,
  gameStatus: 'loading', // loading, playing, gameOver
  metrics: {},
  currentDay: 1,
  currentEvent: null,
  eventDeck: [],
  quizAnswered: false,
  totalScore: 0,
  scoreBreakdown: {},
  actionPool: []
};

/**
 * Initialize game on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize theme
    initializeTheme();
    
    // Load game data based on selected scenario
    const selectedScenario = localStorage.getItem('selectedScenario') || 'central_highlands';
    const response = await fetch(`gameData/${selectedScenario}.json`);
    gameState.gameData = await response.json();

    // Display scenario name in header
    const scenarioElement = document.getElementById('scenarioName');
    if (scenarioElement) {
      // Convert scenario ID to readable name (e.g., 'central_highlands' -> 'Central Highlands')
      const scenarioName = selectedScenario
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      scenarioElement.textContent = scenarioName;
    }

    // Initialize game
    initializeGame();
    setupEventListeners();
    gameState.gameStatus = 'playing';

    // Draw first event (generates actionPool)
    drawNextEvent();
    
    // Render UI after event is drawn
    renderUI();

  } catch (error) {
    console.error('Failed to load game data:', error);
    alert('Failed to load game. Please refresh the page.');
  }
});

/**
 * Initialize theme system
 */
function initializeTheme() {
  // No quick actions needed
}


/**
 * Set up initial game state
 */
function initializeGame() {
  const initial = gameState.gameData.initialState;
  gameState.metrics = {
    safety: initial.safety,
    infrastructure: initial.infrastructure,
    morale: initial.morale,
    resourcePoints: initial.resourcePoints
  };
  gameState.currentDay = 1;
  gameState.quizAnswered = false;

  // Shuffle event deck
  gameState.eventDeck = shuffleArray(gameState.gameData.events);
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {

  // Tip modal
  document.getElementById('closeTipBtn').addEventListener('click', () => {
    closeModal('tipModal');
  });

  document.getElementById('tipAckBtn').addEventListener('click', () => {
    closeModal('tipModal');
    processNextDay();
  });

  // Help modal
  document.getElementById('helpBtn').addEventListener('click', () => {
    openModal('helpModal');
  });

  document.getElementById('closeHelpBtn').addEventListener('click', () => {
    closeModal('helpModal');
  });

  document.getElementById('closeHelpConfirmBtn').addEventListener('click', () => {
    closeModal('helpModal');
  });

  // Restart button
  document.getElementById('restartBtn').addEventListener('click', () => {
    if (confirm(i18n('Restart Game? Current progress will be lost.'))) {
      initializeGame();
      gameState.gameStatus = 'playing';
      drawNextEvent();
    }
  });
}

/**
 * Draw next event from shuffled deck
 */
function drawNextEvent() {
  if (gameState.eventDeck.length === 0) {
    gameState.eventDeck = shuffleArray(gameState.gameData.events);
  }

  gameState.currentEvent = gameState.eventDeck.pop();
  displayEvent();
  generateActionPool();
}

/**
 * Generate a random action pool for the current day
 * Strategy (All Days, including Day 1):
 * 1. Find the "Do Nothing" action (category: risk)
 * 2. Get all other actions
 * 3. Randomly pick 3 actions from the full pool
 * 4. Always add "Do Nothing" as the 4th option
 * 5. Shuffle so Do Nothing isn't always in the same position
 * 6. Ensure exactly 4 actions are available each day
 */
function generateActionPool() {
  const allActions = gameState.gameData.actions;
  
  // Find the "Do Nothing" action (has category: 'risk')
  const doNothingAction = allActions.find(a => a.category === 'risk');
  
  // Get all other actions (exclude Do Nothing)
  const otherActions = allActions.filter(a => a.category !== 'risk');
  
  // Randomly shuffle and pick 3 actions
  const shuffledOthers = shuffleArray(otherActions);
  const selectedActions = shuffledOthers.slice(0, 3);
  
  // Build action pool with 3 random + Do Nothing
  let actionPool = selectedActions;
  if (doNothingAction) {
    actionPool.push(doNothingAction);
  }
  
  // Final shuffle so Do Nothing position is random
  gameState.actionPool = shuffleArray(actionPool).slice(0, 4);
  
  // Log for debugging
  console.log(`Day ${gameState.currentDay} - Random Action Pool Generated`);
  console.log(`Generated ${gameState.actionPool.length} actions (3 random + Do Nothing)`);
  console.log('Action Pool:', gameState.actionPool.map(a => a.id));
}

/**
 * Apply action to game state
 */
function executeAction(action) {
  // Apply effects to metrics
  Object.entries(action.effects).forEach(([metric, value]) => {
    gameState.metrics[metric] += value;
  });

  // Clamp values to valid ranges
  gameState.metrics.safety = clamp(gameState.metrics.safety, 0, 100);
  gameState.metrics.infrastructure = clamp(gameState.metrics.infrastructure, 0, 100);
  gameState.metrics.morale = clamp(gameState.metrics.morale, 0, 100);
  gameState.metrics.resourcePoints = clamp(gameState.metrics.resourcePoints, 0, 999);

  // Update UI immediately
  updateMeters();
  updateRoundDisplay(); // Explicitly update round counter for immediate visual feedback
  renderActions(); // Re-render actions to reflect updated RP

  // Show tip
  showTip();
}

/**
 * Move to next round
 */
function processNextDay() {
  gameState.currentDay++;
  updateRoundDisplay(); // Update round counter display immediately

  if (gameState.currentDay > gameState.gameData.initialState.totalDays) {
    endGame();
  } else {
    // 30% chance to show quiz
    if (Math.random() < 0.3 && !gameState.quizAnswered) {
      showQuiz();
    } else {
      drawNextEvent();
    }
  }
}

/**
 * Show quiz modal
 */
function showQuiz() {
  const event = gameState.currentEvent;
  const lang = gameState.currentLanguage;
  const quiz = event.quiz;

  let optionsHTML = '<div style="text-align: left;">';
  quiz.options.forEach((option, index) => {
    optionsHTML += `
      <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 0.95rem;">
        <input type="radio" name="quiz-option" value="${index}" style="margin-right: 8px;">
        ${option[lang]}
      </label>
    `;
  });
  optionsHTML += '</div>';

  Swal.fire({
    title: '🧠 ' + i18n('quizTitle', 'Safety Quiz'),
    html: `
      <div style="text-align: left; margin: 20px 0;">
        <p style="font-size: 1rem; font-weight: 500; margin-bottom: 20px; color: #2c3e50;">
          ${quiz.question[lang]}
        </p>
        ${optionsHTML}
      </div>
    `,
    icon: 'question',
    showCancelButton: false,
    confirmButtonColor: '#2c5f8d',
    confirmButtonText: i18n('understood', 'Submit Answer'),
    didOpen: (modal) => {
      const firstRadio = modal.querySelector('input[type="radio"]');
      if (firstRadio) firstRadio.focus();
    },
    preConfirm: () => {
      const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
      if (!selectedOption) {
        Swal.showValidationMessage(
          lang === 'en' ? 'Please select an answer!' : 'Vui lòng chọn một câu trả lời!'
        );
        return false;
      }
      return parseInt(selectedOption.value);
    }
  }).then((result) => {
    if (result.isConfirmed) {
      checkQuizAnswer(result.value, quiz.correctAnswer);
    }
  });

  gameState.quizAnswered = true;
}

/**
 * Check quiz answer
 */
function checkQuizAnswer(selectedIndex, correctIndex) {
  const event = gameState.currentEvent;
  const lang = gameState.currentLanguage;
  const isCorrect = selectedIndex === correctIndex;

  let icon = isCorrect ? 'success' : 'error';
  let title = isCorrect ? '✅ Correct!' : '❌ Incorrect';
  let message = '';
  let backgroundColor = isCorrect ? '#d4edda' : '#f8d7da';
  let confirmColor = isCorrect ? '#27ae60' : '#e74c3c';

  if (isCorrect) {
    message = lang === 'en' 
      ? `<p style="font-size: 1rem; color: #155724;">Excellent! You earned <strong>+2 RP</strong>!</p>
         <p style="font-size: 0.9rem; color: #155724; margin-top: 10px;">💡 <strong>Tip:</strong> ${event.tip[lang]}</p>`
      : `<p style="font-size: 1rem; color: #155724;">Tuyệt vời! Bạn kiếm được <strong>+2 RP</strong>!</p>
         <p style="font-size: 0.9rem; color: #155724; margin-top: 10px;">💡 <strong>Mẹo:</strong> ${event.tip[lang]}</p>`;
    gameState.metrics.resourcePoints += 2;
    updateMeters();
  } else {
    message = lang === 'en'
      ? `<p style="font-size: 1rem; color: #721c24;">Not quite right. The correct answer is: <strong>${event.quiz.options[correctIndex][lang]}</strong></p>
         <p style="font-size: 0.9rem; color: #721c24; margin-top: 10px;">💡 <strong>Tip:</strong> ${event.tip[lang]}</p>`
      : `<p style="font-size: 1rem; color: #721c24;">Chưa chính xác. Câu trả lời đúng là: <strong>${event.quiz.options[correctIndex][lang]}</strong></p>
         <p style="font-size: 0.9rem; color: #721c24; margin-top: 10px;">💡 <strong>Mẹo:</strong> ${event.tip[lang]}</p>`;
  }

  Swal.fire({
    title: title,
    html: message,
    icon: icon,
    iconColor: isCorrect ? '#27ae60' : '#e74c3c',
    background: backgroundColor,
    confirmButtonColor: confirmColor,
    confirmButtonText: lang === 'en' ? 'Continue' : 'Tiếp tục',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: (modal) => {
      modal.style.borderRadius = '12px';
    }
  }).then(() => {
    drawNextEvent();
  });
}

/**
 * Calculate final score based on game performance
 * Scoring System:
 * - Base Score: 0-100 points
 * - Safety Performance: 0-25 points (prioritize safety as most important)
 * - Infrastructure: 0-20 points (resilience and recovery capability)
 * - Morale: 0-15 points (community trust and cooperation)
 * - Resource Efficiency: 0-20 points (wise budget management)
 * - Bonus: 0-20 points (risk-taking strategy and perfect metrics)
 */
function calculateScore() {
  const safety = gameState.metrics.safety;
  const infrastructure = gameState.metrics.infrastructure;
  const morale = gameState.metrics.morale;
  const rp = gameState.metrics.resourcePoints;
  
  let score = 0;
  let breakdown = {};

  // 1. Safety Score (0-25) - Most Important
  // Safety ≥ 95: 25 pts | 85-94: 20 pts | 70-84: 15 pts | 50-69: 8 pts | <50: 0 pts
  if (safety >= 95) {
    breakdown.safety = 25;
  } else if (safety >= 85) {
    breakdown.safety = 20;
  } else if (safety >= 70) {
    breakdown.safety = 15;
  } else if (safety >= 50) {
    breakdown.safety = 8;
  } else {
    breakdown.safety = 0;
  }
  score += breakdown.safety;

  // 2. Infrastructure Score (0-20) - Foundation for Recovery
  // Infra ≥ 90: 20 pts | 80-89: 16 pts | 60-79: 12 pts | 40-59: 6 pts | <40: 0 pts
  if (infrastructure >= 90) {
    breakdown.infrastructure = 20;
  } else if (infrastructure >= 80) {
    breakdown.infrastructure = 16;
  } else if (infrastructure >= 60) {
    breakdown.infrastructure = 12;
  } else if (infrastructure >= 40) {
    breakdown.infrastructure = 6;
  } else {
    breakdown.infrastructure = 0;
  }
  score += breakdown.infrastructure;

  // 3. Morale Score (0-15) - Community Resilience
  // Morale ≥ 80: 15 pts | 60-79: 10 pts | 40-59: 5 pts | <40: 0 pts
  if (morale >= 80) {
    breakdown.morale = 15;
  } else if (morale >= 60) {
    breakdown.morale = 10;
  } else if (morale >= 40) {
    breakdown.morale = 5;
  } else {
    breakdown.morale = 0;
  }
  score += breakdown.morale;

  // 4. Resource Efficiency Score (0-20) - Budget Management
  // Spent ≥ 50 RP (from 50 starting): 20 pts | 40-49: 16 pts | 30-39: 12 pts | 20-29: 8 pts | <20: 4 pts
  const rpSpent = 50 - rp; // Started with 50
  if (rpSpent >= 50) {
    breakdown.efficiency = 20;
  } else if (rpSpent >= 40) {
    breakdown.efficiency = 16;
  } else if (rpSpent >= 30) {
    breakdown.efficiency = 12;
  } else if (rpSpent >= 20) {
    breakdown.efficiency = 8;
  } else {
    breakdown.efficiency = 4;
  }
  score += breakdown.efficiency;

  // 5. Bonus Points (0-20)
  breakdown.bonus = 0;
  
  // Perfect Safety (≥95) + Perfect Infra (≥90): +10 bonus
  if (safety >= 95 && infrastructure >= 90) {
    breakdown.bonus += 10;
  }
  
  // Win condition achieved (Safety ≥70 AND Infra ≥60): +5 bonus
  if (safety >= 70 && infrastructure >= 60) {
    breakdown.bonus += 5;
  }
  
  // All metrics ≥80: +5 bonus (excellent balance)
  if (safety >= 80 && infrastructure >= 80 && morale >= 80) {
    breakdown.bonus += 5;
  }
  
  score += breakdown.bonus;

  // Cap total score at 100
  gameState.totalScore = Math.min(score, 100);
  gameState.scoreBreakdown = breakdown;
  
  return gameState.totalScore;
}

/**
 * End game and show summary
 */
function endGame() {
  gameState.gameStatus = 'gameOver';

  const safety = gameState.metrics.safety;
  const infrastructure = gameState.metrics.infrastructure;
  const morale = gameState.metrics.morale;
  const rp = gameState.metrics.resourcePoints;
  const lang = gameState.currentLanguage;

  // Calculate final score
  const finalScore = calculateScore();

  const rankInfo = getPlayerRank(safety, infrastructure);
  const won = checkWinCondition(safety, infrastructure);

  const mainTitle = won 
    ? (lang === 'en' ? '🎉 Mission Accomplished!' : '🎉 Nhiệm Vụ Thành Công!')
    : (lang === 'en' ? '⚠️ Game Over' : '⚠️ Kết Thúc Trò Chơi');

  // Build score breakdown display
  const scoreBreakdown = gameState.scoreBreakdown;
  const scoreHTML = lang === 'en'
    ? `
      <div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #ffc107;">
        <h4 style="text-align: center; color: #856404; margin: 0 0 10px 0; font-size: 1.1rem;">
          🏆 Final Score: <span style="font-size: 1.3rem; font-weight: bold;">${finalScore}/100</span>
        </h4>
        <div style="font-size: 0.85rem; color: #856404; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0;">
            <span>Safety Performance:</span>
            <span style="font-weight: bold;">${scoreBreakdown.safety} / 25 pts</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0;">
            <span>Infrastructure:</span>
            <span style="font-weight: bold;">${scoreBreakdown.infrastructure} / 20 pts</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0;">
            <span>Community Morale:</span>
            <span style="font-weight: bold;">${scoreBreakdown.morale} / 15 pts</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0;">
            <span>Resource Efficiency:</span>
            <span style="font-weight: bold;">${scoreBreakdown.efficiency} / 20 pts</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0; border-top: 1px solid #cc9900; padding-top: 8px;">
            <span>Bonus Points:</span>
            <span style="font-weight: bold; color: #cc6600;">+ ${scoreBreakdown.bonus}</span>
          </div>
        </div>
      </div>
    `
    : `
      <div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #ffc107;">
        <h4 style="text-align: center; color: #856404; margin: 0 0 10px 0; font-size: 1.1rem;">
          🏆 Điểm Cuối Cùng: <span style="font-size: 1.3rem; font-weight: bold;">${finalScore}/100</span>
        </h4>
        <div style="font-size: 0.85rem; color: #856404; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0;">
            <span>Hiệu Suất An Toàn:</span>
            <span style="font-weight: bold;">${scoreBreakdown.safety} / 25 pts</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0;">
            <span>Cơ Sở Hạ Tầng:</span>
            <span style="font-weight: bold;">${scoreBreakdown.infrastructure} / 20 pts</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0;">
            <span>Tinh Thần Cộng Đồng:</span>
            <span style="font-weight: bold;">${scoreBreakdown.morale} / 15 pts</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0;">
            <span>Hiệu Quả Tài Nguyên:</span>
            <span style="font-weight: bold;">${scoreBreakdown.efficiency} / 20 pts</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0; border-top: 1px solid #cc9900; padding-top: 8px;">
            <span>Điểm Thưởng:</span>
            <span style="font-weight: bold; color: #cc6600;">+ ${scoreBreakdown.bonus}</span>
          </div>
        </div>
      </div>
    `;

  const summaryHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 3rem; margin-bottom: 10px;">${rankInfo.icon}</div>
      <h3 style="font-size: 1.3rem; color: ${rankInfo.color}; margin-bottom: 5px; font-weight: bold;">
        ${rankInfo.rank}
      </h3>
      <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">
        ${lang === 'en' ? 'After 8 days of crisis management' : 'Sau 8 ngày quản lý khủng hoảng'}
      </p>
    </div>

    ${scoreHTML}

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <h4 style="font-size: 1rem; color: #2c3e50; margin-bottom: 12px; text-align: left;">
        ${lang === 'en' ? '📊 Final Metrics' : '📊 Chỉ Số Cuối Cùng'}
      </h4>
      
      <div style="text-align: left; font-size: 0.95rem;">
        <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span><strong>${lang === 'en' ? 'Safety' : 'An Toàn'}:</strong></span>
          <span style="color: #27ae60; font-weight: bold;">${formatPercent(safety)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span><strong>${lang === 'en' ? 'Infrastructure' : 'Cơ Sở Hạ Tầng'}:</strong></span>
          <span style="color: #f39c12; font-weight: bold;">${formatPercent(infrastructure)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span><strong>${lang === 'en' ? 'Morale' : 'Tinh Thần'}:</strong></span>
          <span style="color: #e67e22; font-weight: bold;">${formatPercent(morale)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0;">
          <span><strong>${lang === 'en' ? 'Resource Points' : 'Điểm Tài Nguyên'}:</strong></span>
          <span style="color: #3498db; font-weight: bold;">${roundValue(rp)} RP</span>
        </div>
      </div>
    </div>

    <div style="background: ${won ? '#d4edda' : '#f8d7da'}; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
      <p style="font-size: 0.9rem; color: ${won ? '#155724' : '#721c24'}; margin: 0; line-height: 1.5;">
        <strong>${won 
          ? (lang === 'en' 
              ? '✅ Excellent leadership! Your community survived the flood crisis with proper preparation and swift action.' 
              : '✅ Lãnh đạo xuất sắc! Cộng đồng của bạn sống sót qua khủng hoảng lũ lụt.')
          : (lang === 'en' 
              ? '❌ The community struggled during this flood season. Consider different strategies in your next attempt.' 
              : '❌ Cộng đồng gặp khó khăn trong mùa lũ này. Hãy thử các chiến lược khác nhau trong lần tiếp theo.')
        }</strong>
      </p>
    </div>

    <div style="background: #e3f2fd; padding: 12px; border-radius: 6px; border-left: 4px solid #2196F3;">
      <p style="font-size: 0.85rem; color: #1565c0; margin: 0;">
        <strong>💡 ${lang === 'en' ? 'Learning Tip' : 'Mẹo Học Tập'}:</strong><br/>
        ${lang === 'en' 
          ? 'Replay to explore different strategies (Prepare early, Defend during crisis, Recover after). Each approach teaches valuable lessons about flood resilience!'
          : 'Chơi lại để khám phá các chiến lược khác nhau (Chuẩn Bị sớm, Bảo Vệ trong khủng hoảng, Phục Hồi sau). Mỗi cách tiếp cận dạy những bài học quý báu về khả năng chống chịu lũ lụt!'}
      </p>
    </div>
  `;

  Swal.fire({
    title: mainTitle,
    html: summaryHTML,
    icon: won ? 'success' : 'info',
    iconColor: won ? '#27ae60' : '#f39c12',
    confirmButtonText: lang === 'en' ? '🔄 Replay Game' : '🔄 Chơi Lại',
    confirmButtonColor: '#2c5f8d',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showCloseButton: false,
    width: '650px'
  }).then((result) => {
    if (result.isConfirmed) {
      replayGame();
    }
  });
}

/**
 * Replay game with reset
 */
function replayGame() {
  gameState.gameStatus = 'playing';
  gameState.currentDay = 1;
  gameState.quizAnswered = false;
  gameState.totalScore = 0;

  const initial = gameState.gameData.initialState;
  gameState.metrics = {
    safety: initial.safety,
    infrastructure: initial.infrastructure,
    morale: initial.morale,
    resourcePoints: initial.resourcePoints
  };

  gameState.eventDeck = shuffleArray(gameState.gameData.events);

  updateMeters();
  updateRoundDisplay();
  renderActions();
  drawNextEvent();

  const lang = gameState.currentLanguage;
  Swal.fire({
    title: lang === 'en' ? '🎮 New Game Started!' : '🎮 Trò Chơi Mới Bắt Đầu!',
    html: lang === 'en' 
      ? '<p style="font-size: 0.95rem;">Try a different strategy this time. Will you Prepare, Defend, or Recover?</p>'
      : '<p style="font-size: 0.95rem;">Hãy thử một chiến lược khác lần này. Bạn sẽ Chuẩn Bị, Bảo Vệ hay Phục Hồi?</p>',
    icon: 'success',
    iconColor: '#27ae60',
    confirmButtonText: lang === 'en' ? 'Let\'s Go!' : 'Bắt Đầu Nào!',
    confirmButtonColor: '#2c5f8d',
    allowOutsideClick: false,
    allowEscapeKey: false
  });
}
