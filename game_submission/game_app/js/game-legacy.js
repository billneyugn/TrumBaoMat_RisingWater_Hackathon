// ====================================
// RISING WATERS: GAME SCRIPT
// ====================================

// Global State
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

// ====================================
// INITIALIZATION
// ====================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load game data
    const response = await fetch('gameData.json');
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

function initializeGame() {
  // Copy initial metrics
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
  gameState.eventDeck = [...gameState.gameData.events].sort(() => Math.random() - 0.5);
}

function setupEventListeners() {
  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      gameState.currentLanguage = e.target.dataset.lang;
      renderUI();
    });
  });

  // Action buttons will be created dynamically
  // Quiz modal
  document.getElementById('closeQuizBtn').addEventListener('click', () => {
    closeModal('quizModal');
  });

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

  // Game over modal
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    closeModal('gameOverModal');
    initializeGame();
    gameState.gameStatus = 'playing';
    drawNextEvent();
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

// ====================================
// LOCALIZATION
// ====================================

function i18n(key, fallback = key) {
  const langData = gameState.gameData.i18n[gameState.currentLanguage];
  return langData && langData[key] ? langData[key] : fallback;
}

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

// ====================================
// UI RENDERING
// ====================================

function renderUI() {
  updateI18nText();
  updateMeters();
  updateRoundDisplay();
  renderActions();
}

function updateMeters() {
  const metrics = ['safety', 'infrastructure', 'morale'];
  metrics.forEach(metric => {
    const value = Math.max(0, Math.min(100, gameState.metrics[metric]));
    document.getElementById(`${metric}Value`).textContent = Math.round(value);
    document.getElementById(`${metric}Meter`).style.width = value + '%';
  });

  // Resource Points (not a percentage)
  const rpValue = Math.max(0, gameState.metrics.resourcePoints);
  document.getElementById('resourceValue').textContent = Math.round(rpValue);
  const rpPercent = Math.min(100, (rpValue / 100) * 100);
  document.getElementById('resourceMeter').style.width = rpPercent + '%';
}

function updateRoundDisplay() {
  document.getElementById('roundDisplay').textContent = gameState.currentRound;
}

function renderActions() {
  const actionsGrid = document.getElementById('actionsGrid');
  actionsGrid.innerHTML = '';

  gameState.gameData.actions.forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.innerHTML = `
      <div class="action-btn-title">${action.title[gameState.currentLanguage]}</div>
      <div class="action-btn-desc">${action.description[gameState.currentLanguage]}</div>
    `;

    btn.addEventListener('click', () => {
      // Check if player has enough resources
      if (action.cost > gameState.metrics.resourcePoints) {
        alert(`Not enough Resource Points! Need ${action.cost}, have ${Math.round(gameState.metrics.resourcePoints)}.`);
        return;
      }

      executeAction(action);
    });

    actionsGrid.appendChild(btn);
  });
}

// ====================================
// EVENT HANDLING
// ====================================

function drawNextEvent() {
  if (gameState.eventDeck.length === 0) {
    gameState.eventDeck = [...gameState.gameData.events].sort(() => Math.random() - 0.5);
  }

  gameState.currentEvent = gameState.eventDeck.pop();
  displayEvent();
}

function displayEvent() {
  const event = gameState.currentEvent;
  const lang = gameState.currentLanguage;

  document.getElementById('eventIcon').textContent = event.icon;
  document.getElementById('eventTitle').textContent = event.title[lang];
  document.getElementById('eventDescription').textContent = event.description[lang];

  // Display effects
  const effectsEl = document.getElementById('eventEffects');
  effectsEl.innerHTML = '';

  Object.entries(event.effects).forEach(([metric, value]) => {
    if (value !== 0) {
      const badge = document.createElement('div');
      badge.className = `effect-badge ${value > 0 ? 'positive' : 'negative'}`;
      badge.textContent = `${metric}: ${value > 0 ? '+' : ''}${value}`;
      effectsEl.appendChild(badge);
    }
  });
}

function executeAction(action) {
  const lang = gameState.currentLanguage;

  // Apply effects
  Object.entries(action.effects).forEach(([metric, value]) => {
    gameState.metrics[metric] += value;
  });

  // Clamp values
  gameState.metrics.safety = Math.max(0, Math.min(100, gameState.metrics.safety));
  gameState.metrics.infrastructure = Math.max(0, Math.min(100, gameState.metrics.infrastructure));
  gameState.metrics.morale = Math.max(0, Math.min(100, gameState.metrics.morale));
  gameState.metrics.resourcePoints = Math.max(0, gameState.metrics.resourcePoints);

  // Update UI
  updateMeters();

  // Show tip
  showTip();
}

function showTip() {
  const event = gameState.currentEvent;
  const lang = gameState.currentLanguage;

  const tipText = document.getElementById('tipText');
  tipText.textContent = event.tip[lang];

  openModal('tipModal');
}

function processNextRound() {
  gameState.currentRound++;

  if (gameState.currentRound > gameState.gameData.initialState.totalRounds) {
    endGame();
  } else {
    // Chance to show quiz (30% chance)
    if (Math.random() < 0.3 && !gameState.quizAnswered) {
      showQuiz();
    } else {
      drawNextEvent();
    }
  }
}

// ====================================
// QUIZ LOGIC (WITH SWEETALERT2)
// ====================================

function showQuiz() {
  const event = gameState.currentEvent;
  const lang = gameState.currentLanguage;
  const quiz = event.quiz;

  // Build HTML for quiz options
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
    cancelButtonColor: '#95a5a6',
    confirmButtonText: i18n('understood', 'Submit Answer'),
    didOpen: (modal) => {
      // Focus on first radio button
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

function checkQuizAnswer(selectedIndex, correctIndex) {
  const event = gameState.currentEvent;
  const lang = gameState.currentLanguage;
  const isCorrect = selectedIndex === correctIndex;

  // Determine message and icon
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
    // Proceed to next round/event
    drawNextEvent();
  });
}

// ====================================
// GAME OVER
// ====================================

function endGame() {
  gameState.gameStatus = 'gameOver';

  const safety = gameState.metrics.safety;
  const infrastructure = gameState.metrics.infrastructure;
  const morale = gameState.metrics.morale;
  const rp = gameState.metrics.resourcePoints;
  const lang = gameState.currentLanguage;

  // Calculate ranking based on final metrics
  let rank, rankColor, rankIcon;
  
  if (safety >= 70 && infrastructure >= 70) {
    rank = lang === 'en' ? '🏆 Resilient Survivor' : '🏆 Cộng Đồng Bình Yên';
    rankColor = '#27ae60'; // Green
    rankIcon = '🌟';
  } else if (safety >= 50 && infrastructure >= 50) {
    rank = lang === 'en' ? '📚 Adaptive Learner' : '📚 Nhà Lãnh Đạo Khôn Ngoan';
    rankColor = '#f39c12'; // Orange
    rankIcon = '📈';
  } else {
    rank = lang === 'en' ? '⚠️ Unprepared' : '⚠️ Chưa Chuẩn Bị';
    rankColor = '#e74c3c'; // Red
    rankIcon = '❌';
  }

  // Determine if player won
  const winCondition = gameState.gameData.winCondition;
  const won = safety >= winCondition.minSafety && infrastructure >= winCondition.minInfrastructure;

  // Main title
  const mainTitle = won 
    ? (lang === 'en' ? '🎉 Mission Accomplished!' : '🎉 Nhiệm Vụ Thành Công!')
    : (lang === 'en' ? '⚠️ Game Over' : '⚠️ Kết Thúc Trò Chơi');

  // Build detailed summary HTML
  const summaryHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 3rem; margin-bottom: 10px;">${rankIcon}</div>
      <h3 style="font-size: 1.3rem; color: ${rankColor}; margin-bottom: 5px; font-weight: bold;">
        ${rank}
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
          <span style="color: #27ae60; font-weight: bold;">${Math.round(safety)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span><strong>${lang === 'en' ? 'Infrastructure' : 'Cơ Sở Hạ Tầng'}:</strong></span>
          <span style="color: #f39c12; font-weight: bold;">${Math.round(infrastructure)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span><strong>${lang === 'en' ? 'Morale' : 'Tinh Thần'}:</strong></span>
          <span style="color: #e67e22; font-weight: bold;">${Math.round(morale)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0;">
          <span><strong>${lang === 'en' ? 'Resource Points' : 'Điểm Tài Nguyên'}:</strong></span>
          <span style="color: #3498db; font-weight: bold;">${Math.round(rp)} RP</span>
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

function replayGame() {
  // Reset all game state
  gameState.currentLanguage = gameState.currentLanguage; // Keep current language
  gameState.gameStatus = 'playing';
  gameState.currentRound = 1;
  gameState.quizAnswered = false;
  gameState.totalScore = 0;

  // Reset metrics to initial values
  const initial = gameState.gameData.initialState;
  gameState.metrics = {
    safety: initial.safety,
    infrastructure: initial.infrastructure,
    morale: initial.morale,
    resourcePoints: initial.resourcePoints
  };

  // Reshuffle event deck
  gameState.eventDeck = [...gameState.gameData.events].sort(() => Math.random() - 0.5);

  // Update UI
  updateMeters();
  updateRoundDisplay();
  renderActions();

  // Draw first event
  drawNextEvent();

  // Show replay confirmation
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

// ====================================
// MODAL MANAGEMENT
// ====================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('active');
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});
