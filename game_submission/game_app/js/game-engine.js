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
  currentRound: 1,
  currentEvent: null,
  eventDeck: [],
  quizAnswered: false,
  totalScore: 0
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

    // Initialize game
    initializeGame();
    setupEventListeners();
    renderUI();
    gameState.gameStatus = 'playing';

    // Draw first event
    drawNextEvent();
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
  gameState.currentRound = 1;
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
    processNextRound();
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
function processNextRound() {
  gameState.currentRound++;
  updateRoundDisplay(); // Update round counter display immediately

  if (gameState.currentRound > gameState.gameData.initialState.totalRounds) {
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
 * End game and show summary
 */
function endGame() {
  gameState.gameStatus = 'gameOver';

  const safety = gameState.metrics.safety;
  const infrastructure = gameState.metrics.infrastructure;
  const morale = gameState.metrics.morale;
  const rp = gameState.metrics.resourcePoints;
  const lang = gameState.currentLanguage;

  const rankInfo = getPlayerRank(safety, infrastructure);
  const won = checkWinCondition(safety, infrastructure);

  const mainTitle = won 
    ? (lang === 'en' ? '🎉 Mission Accomplished!' : '🎉 Nhiệm Vụ Thành Công!')
    : (lang === 'en' ? '⚠️ Game Over' : '⚠️ Kết Thúc Trò Chơi');

  const summaryHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 3rem; margin-bottom: 10px;">${rankInfo.icon}</div>
      <h3 style="font-size: 1.3rem; color: ${rankInfo.color}; margin-bottom: 5px; font-weight: bold;">
        ${rankInfo.rank}
      </h3>
      <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">
        ${lang === 'en' ? 'After 8 rounds of crisis management' : 'Sau 8 vòng quản lý khủng hoảng'}
      </p>
    </div>

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
          : 'Chơi lại để khám phá các chiến lược khác nhau (Chuẩn bị sớm, Bảo vệ trong khủng hoảng, Phục hồi sau). Mỗi cách tiếp cận dạy những bài học quý báu về khả năng chống chịu lũ lụt!'}
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
    width: '600px'
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
  gameState.currentRound = 1;
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
