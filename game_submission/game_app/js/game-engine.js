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

    // Display welcome modal on first load
    showWelcomeModal();

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

  // Welcome modal
  document.getElementById('closeWelcomeBtn').addEventListener('click', () => {
    closeModal('welcomeModal');
  });

  document.getElementById('startGameBtn').addEventListener('click', () => {
    closeModal('welcomeModal');
  });

  // Restart button
  document.getElementById('restartBtn').addEventListener('click', () => {
    if (confirm(i18n('Restart Game? Current progress will be lost.'))) {
      location.reload();
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
 * Generate action pool with at least 1 event-relevant action
 */
function generateActionPool() {
  const allActions = gameState.gameData.actions;
  const currentEvent = gameState.currentEvent;
  
  // Find the "Do Nothing" action (has category: 'risk')
  const doNothingAction = allActions.find(a => a.category === 'risk');
  
  // Get all other actions (exclude Do Nothing)
  const otherActions = allActions.filter(a => a.category !== 'risk');
  
  // ===== EVENT-TO-ACTION MAPPING =====
  // Maps event IDs to recommended action categories
  // Ensures at least 1 action in the pool is relevant to the current event
  const eventActionMap = {
    // Rainfall/Water Level Events
    'event_slow_rain': ['prepare', 'recover'],
    'event_heavy_rain': ['prepare', 'defend'],
    'event_dike_breach': ['defend', 'recover'],
    'event_landslide_warning': ['defend'],
    
    // Damage/Infrastructure Events
    'event_irrigation_damage': ['recover'],
    'event_water_recedes': ['recover'],
    'event_communication_down': ['prepare'],
    
    // Emergency Events
    'event_rescue_request': ['defend'],
    'event_disease_risk': ['defend'],
    'event_supplies_shortage': ['recover'],
    
    // Positive Events
    'event_clear_weather': ['recover'],
    'event_successful_evacuation': ['defend'],
    'event_aid_arrives': ['recover'],
    
    // Add more events as needed - defaults to empty for unmapped events
  };
  
  // Get relevant categories for current event
  const eventId = currentEvent.id;
  const relevantCategories = eventActionMap[eventId] || [];
  
  // ===== ACTION POOL SELECTION LOGIC =====
  let selectedActions = [];
  
  if (relevantCategories.length > 0) {
    // Filter actions by relevant categories
    const relevantActions = otherActions.filter(a => 
      relevantCategories.includes(a.category)
    );
    
    if (relevantActions.length > 0) {
      // Pick 1 random relevant action (guaranteed event-related)
      const shuffledRelevant = shuffleArray(relevantActions);
      const eventRelatedAction = shuffledRelevant[0];
      selectedActions.push(eventRelatedAction);
      
      // Pick 2 more random actions from ALL other actions (for variety)
      const remaining = otherActions.filter(a => a.id !== eventRelatedAction.id);
      const shuffledRemaining = shuffleArray(remaining);
      selectedActions.push(...shuffledRemaining.slice(0, 2));
    } else {
      // Fallback: if no relevant actions found, pick 3 random actions
      const shuffledOthers = shuffleArray(otherActions);
      selectedActions = shuffledOthers.slice(0, 3);
    }
  } else {
    // Fallback: if event not in map, pick 3 random actions
    const shuffledOthers = shuffleArray(otherActions);
    selectedActions = shuffledOthers.slice(0, 3);
  }
  
  // Build final action pool with "Do Nothing"
  let actionPool = selectedActions;
  if (doNothingAction) {
    actionPool.push(doNothingAction);
  }
  
  // Final shuffle so Do Nothing position is random (and overall action order is randomized)
  gameState.actionPool = shuffleArray(actionPool).slice(0, 4);
  
  // Log for debugging
  console.log(`Day ${gameState.currentDay} - Action Pool Generated`);
  console.log(`Event: ${eventId}`);
  if (relevantCategories.length > 0) {
    console.log(`Relevant categories: ${relevantCategories.join(', ')}`);
    console.log(`Event-related action: ${selectedActions[0]?.id}`);
  } else {
    console.log(`No relevant categories mapped for this event`);
  }
  console.log('Final Action Pool:', gameState.actionPool.map(a => a.id));
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

  // Cap total score at 80
  gameState.totalScore = Math.min(score, 80);
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
          🏆 Final Score: <span style="font-size: 1.3rem; font-weight: bold;">${finalScore}/80</span>
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
          🏆 Điểm Cuối Cùng: <span style="font-size: 1.3rem; font-weight: bold;">${finalScore}/80</span>
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

    ${generateDynamicFeedback(safety, infrastructure, morale, rp, won, lang)}

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
    denyButtonText: lang === 'en' ? '🗺️ Choose Scenario' : '🗺️ Chọn Kịch Bản',
    showDenyButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showCloseButton: false,
    width: '650px'
  }).then((result) => {
    if (result.isConfirmed) {
      replayGame();
    } else if (result.isDenied) {
      showScenarioSelector();
    }
  });
}

/**
 * Generate dynamic feedback based on player performance
 */
function generateDynamicFeedback(safety, infrastructure, morale, rp, won, lang) {
  // Find lowest metric
  const metrics = {
    safety: { value: safety, name: lang === 'en' ? 'Safety' : 'An Toàn', icon: '🛡️' },
    infrastructure: { value: infrastructure, name: lang === 'en' ? 'Infrastructure' : 'Cơ Sở Hạ Tầng', icon: '🏗️' },
    morale: { value: morale, name: lang === 'en' ? 'Morale' : 'Tinh Thần', icon: '💪' }
  };

  let lowest = metrics.safety;
  let lowestKey = 'safety';
  
  if (infrastructure < lowest.value) {
    lowest = metrics.infrastructure;
    lowestKey = 'infrastructure';
  }
  if (morale < lowest.value) {
    lowest = metrics.morale;
    lowestKey = 'morale';
  }

  // Generate feedback based on performance
  let mainFeedback = '';
  let lowMetricTip = '';

  if (won) {
    mainFeedback = lang === 'en'
      ? `✅ Excellent leadership! Your community survived the flood crisis with proper preparation and swift action.`
      : `✅ Lãnh đạo xuất sắc! Cộng đồng của bạn sống sót qua khủng hoảng lũ lụt.`;
  } else {
    // Provide specific feedback based on what went wrong
    if (safety < 50 && infrastructure < 50) {
      mainFeedback = lang === 'en'
        ? `❌ Critical situation: Both Safety and Infrastructure collapsed. Prioritize immediate evacuation and emergency shelters early in future attempts.`
        : `❌ Tình huống nghiêm trọng: Cả An Toàn và Cơ Sở Hạ Tầng đã sụp đổ. Ưu tiên sơ tán khẩn cấp và nơi trú ẩn khẩn cấp sớm trong các lần tiếp theo.`;
    } else if (safety < 70) {
      mainFeedback = lang === 'en'
        ? `⚠️ Safety fell short of target. You need to prioritize evacuation actions and defensive measures to protect your community.`
        : `⚠️ An Toàn không đạt mục tiêu. Bạn cần ưu tiên các hành động sơ tán và biện pháp phòng vệ để bảo vệ cộng đồng.`;
    } else if (infrastructure < 60) {
      mainFeedback = lang === 'en'
        ? `⚠️ Infrastructure dropped below required level. Focus on repair and restoration actions to maintain essential services.`
        : `⚠️ Cơ Sở Hạ Tầng giảm dưới mức yêu cầu. Tập trung vào các hành động sửa chữa và khôi phục để duy trì các dịch vụ thiết yếu.`;
    } else {
      mainFeedback = lang === 'en'
        ? `⚠️ Your community faced challenges. Try focusing more on ${lowest.name.toLowerCase()} in your next attempt—it was your weakest area.`
        : `⚠️ Cộng đồng của bạn gặp phải những thách thức. Hãy tập trung vào ${lowest.name} trong lần tiếp theo—nó là lĩnh vực yếu nhất của bạn.`;
    }
  }

  // Generate tip for lowest metric
  if (lowestKey === 'safety') {
    lowMetricTip = lang === 'en'
      ? `<strong>🛡️ Safety (${safety}%):</strong> Your weakest area. Use "Evacuate People", "Provide Medical Support", and "Organize Rescue Teams" actions more frequently to protect lives.`
      : `<strong>🛡️ An Toàn (${safety}%):</strong> Lĩnh vực yếu nhất của bạn. Sử dụng các hành động "Sơ Tán Dân", "Cung Cấp Y Tế", và "Tổ Chức Đội Cứu Hộ" thường xuyên hơn để bảo vệ sinh mạng.`;
  } else if (lowestKey === 'infrastructure') {
    lowMetricTip = lang === 'en'
      ? `<strong>🏗️ Infrastructure (${infrastructure}%):</strong> Your weakest area. Use "Repair Roads", "Restore Utilities", and "Reinforce Dike" actions to maintain critical services.`
      : `<strong>🏗️ Cơ Sở Hạ Tầng (${infrastructure}%):</strong> Lĩnh vực yếu nhất của bạn. Sử dụng các hành động "Sửa Đường", "Khôi Phục Tiện Ích", và "Gia Cố Đê" để duy trì các dịch vụ quan trọng.`;
  } else {
    lowMetricTip = lang === 'en'
      ? `<strong>💪 Morale (${morale}%):</strong> Your weakest area. Use "Deliver Aid", "Community Support", and "Distribute Relief" to keep community spirits up.`
      : `<strong>💪 Tinh Thần (${morale}%):</strong> Lĩnh vực yếu nhất của bạn. Sử dụng "Cung Cấp Trợ Giúp", "Hỗ Trợ Cộng Đồng", và "Phân Phát Lũ Khẩn Cấp" để giữ tinh thần cộng đồng.`;
  }

  return `
    <div style="background: ${won ? '#d4edda' : '#f8d7da'}; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
      <p style="font-size: 0.9rem; color: ${won ? '#155724' : '#721c24'}; margin: 0; line-height: 1.5;">
        <strong>${mainFeedback}</strong>
      </p>
    </div>

    <div style="background: #fff3cd; padding: 12px; border-radius: 6px; border-left: 4px solid #ffc107; margin-bottom: 15px;">
      <h4 style="font-size: 0.95rem; color: #856404; margin: 0 0 8px 0;">
        ${lang === 'en' ? '🎯 Area to Focus On' : '🎯 Lĩnh Vực Cần Tập Trung'}
      </h4>
      <p style="font-size: 0.85rem; color: #856404; margin: 0; line-height: 1.5;">
        ${lowMetricTip}
      </p>
    </div>
  `;
}

/**
 * Show welcome modal with game briefing
 */
function showWelcomeModal() {
  const lang = gameState.currentLanguage;
  
  const welcomeContent = lang === 'en' 
    ? `
      <p><strong>You are the Community Leader</strong> of a flood-prone town. Over the next 8 days, your mission is to protect lives, defend infrastructure, and maintain community morale as floods rise and fall.</p>
      
      <p><strong>Each day,</strong> unexpected events will challenge you — from sudden rains and dike breaches to rescue missions and disease risks. Choose your actions wisely. Every decision affects:</p>
      
      <ul style="margin: 15px 0; padding-left: 20px;">
        <li><strong>🛡️ Safety</strong> - Lives and protection</li>
        <li><strong>🏗️ Infrastructure</strong> - Roads, utilities, shelter</li>
        <li><strong>💪 Morale</strong> - Community trust and spirit</li>
        <li><strong>💰 Resources (RP)</strong> - Your budget for actions</li>
      </ul>
      
      <p><strong>Your Goal:</strong> Keep your community safe and functioning through the entire flood cycle (8 days).</p>
      
      <p><strong>Learn, adapt, and replay</strong> to master flood preparedness and recovery. Different strategies teach different lessons!</p>
    `
    : `
      <p><strong>Bạn là Nhà Lãnh Đạo Cộng Đồng</strong> của một thị trấn dễ bị lũ lụt. Trong 8 ngày tiếp theo, nhiệm vụ của bạn là bảo vệ sinh mạng, bảo vệ cơ sở hạ tầng và duy trì tinh thần cộng đồng khi lũ lụt dâng lên và rút xuống.</p>
      
      <p><strong>Mỗi ngày,</strong> những sự kiện bất ngờ sẽ thách thức bạn — từ mưa lớn đột ngột, vỡ đê đến các nhiệm vụ cứu hộ và nguy cơ bệnh tật. Chọn hành động của bạn một cách sáng suốt. Mỗi quyết định ảnh hưởng đến:</p>
      
      <ul style="margin: 15px 0; padding-left: 20px;">
        <li><strong>🛡️ An Toàn</strong> - Sinh mạng và bảo vệ</li>
        <li><strong>🏗️ Cơ Sở Hạ Tầng</strong> - Đường, tiện ích, nơi trú ẩn</li>
        <li><strong>💪 Tinh Thần</strong> - Lòng tin và tinh thần cộng đồng</li>
        <li><strong>💰 Tài Nguyên (RP)</strong> - Ngân sách của bạn để hành động</li>
      </ul>
      
      <p><strong>Mục Tiêu Của Bạn:</strong> Giữ cộng đồng của bạn an toàn và hoạt động bình thường trong suốt chu kỳ lũ lụt (8 ngày).</p>
      
      <p><strong>Học hỏi, thích ứng và chơi lại</strong> để thành thạo khả năng chuẩn bị và phục hồi sau lũ lụt. Mỗi chiến lược khác nhau dạy các bài học khác nhau!</p>
    `;
  
  const welcomeEl = document.getElementById('welcomeText');
  if (welcomeEl) {
    welcomeEl.innerHTML = welcomeContent;
  }
  
  openModal('welcomeModal');
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

/**
 * Show scenario selector modal
 */
function showScenarioSelector() {
  const lang = gameState.currentLanguage;
  
  const scenarioHTML = lang === 'en'
    ? `
      <div style="text-align: left; margin-bottom: 15px;">
        <p style="margin-bottom: 20px; color: #2c3e50; font-weight: 500; font-size: 1rem;">
          Choose a flood scenario to experience:
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- Central Highlands -->
          <button onclick="selectScenario('central_highlands')" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 600;
            text-align: left;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(102, 126, 234, 0.4)';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.2)';">
            <div style="font-size: 1.3rem; margin-bottom: 6px; font-weight: 700;">⛰️ Central Highlands</div>
            <div style="font-size: 0.85rem; opacity: 0.95; line-height: 1.4;">Slow but prolonged floods damage roads and fields. Requires long-term resource management.</div>
          </button>
          
          <!-- Hanoi Lowlands -->
          <button onclick="selectScenario('hanoi_lowlands')" style="
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 600;
            text-align: left;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(245, 87, 108, 0.2);
          " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(245, 87, 108, 0.4)';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(245, 87, 108, 0.2)';">
            <div style="font-size: 1.3rem; margin-bottom: 6px; font-weight: 700;">🏙️ Hanoi Lowlands</div>
            <div style="font-size: 0.85rem; opacity: 0.95; line-height: 1.4;">Rapid urban flooding demands quick emergency response. Test your crisis management skills.</div>
          </button>
          
          <!-- Mekong Delta -->
          <button onclick="selectScenario('mekong_detal')" style="
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 600;
            text-align: left;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(79, 172, 254, 0.2);
          " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(79, 172, 254, 0.4)';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(79, 172, 254, 0.2)';">
            <div style="font-size: 1.3rem; margin-bottom: 6px; font-weight: 700;">🌾 Mekong Delta</div>
            <div style="font-size: 0.85rem; opacity: 0.95; line-height: 1.4;">Seasonal flooding affects agriculture. Balance farm recovery with community needs.</div>
          </button>
        </div>
      </div>
    `
    : `
      <div style="text-align: left; margin-bottom: 15px;">
        <p style="margin-bottom: 20px; color: #2c3e50; font-weight: 500; font-size: 1rem;">
          Chọn kịch bản lũ lụt để trải nghiệm:
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- Central Highlands -->
          <button onclick="selectScenario('central_highlands')" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 600;
            text-align: left;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(102, 126, 234, 0.4)';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.2)';">
            <div style="font-size: 1.3rem; margin-bottom: 6px; font-weight: 700;">⛰️ Phiên Bản Tây Nguyên</div>
            <div style="font-size: 0.85rem; opacity: 0.95; line-height: 1.4;">Lũ chậm nhưng kéo dài làm hư hại đường xá và đất nông nghiệp. Yêu cầu quản lý tài nguyên dài hạn.</div>
          </button>
          
          <!-- Hanoi Lowlands -->
          <button onclick="selectScenario('hanoi_lowlands')" style="
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 600;
            text-align: left;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(245, 87, 108, 0.2);
          " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(245, 87, 108, 0.4)';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(245, 87, 108, 0.2)';">
            <div style="font-size: 1.3rem; margin-bottom: 6px; font-weight: 700;">🏙️ Phiên Bản Hà Nội</div>
            <div style="font-size: 0.85rem; opacity: 0.95; line-height: 1.4;">Lũ đô thị nhanh chóng đòi hỏi phản ứng khẩn cấp. Kiểm tra kỹ năng quản lý khủng hoảng của bạn.</div>
          </button>
          
          <!-- Mekong Delta -->
          <button onclick="selectScenario('mekong_detal')" style="
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 600;
            text-align: left;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(79, 172, 254, 0.2);
          " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(79, 172, 254, 0.4)';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(79, 172, 254, 0.2)';">
            <div style="font-size: 1.3rem; margin-bottom: 6px; font-weight: 700;">🌾 Phiên Bản Đồng Bằng Sông Cửu Long</div>
            <div style="font-size: 0.85rem; opacity: 0.95; line-height: 1.4;">Lũ theo mùa ảnh hưởng đến nông nghiệp. Cân bằng phục hồi nông trại với nhu cầu cộng đồng.</div>
          </button>
        </div>
      </div>
    `;
  
  Swal.fire({
    title: lang === 'en' ? '🗺️ Select Your Scenario' : '🗺️ Chọn Kịch Bản',
    html: scenarioHTML,
    icon: 'question',
    iconColor: '#2c5f8d',
    confirmButtonText: lang === 'en' ? 'Back' : 'Quay Lại',
    confirmButtonColor: '#999',
    showConfirmButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showCloseButton: false,
    width: '580px'
  });
}

/**
 * Select a scenario and start new game
 */
function selectScenario(scenario) {
  localStorage.setItem('selectedScenario', scenario);
  location.reload();
}
