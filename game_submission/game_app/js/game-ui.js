// ====================================
// UI.JS - Rendering & Display
// ====================================

/**
 * Render all UI elements
 */
function renderUI() {
  updateI18nText();
  updateMeters();
  updateRoundDisplay();
  renderActions();
}

/**
 * Update all meter displays
 */
function updateMeters() {
  const metrics = ['safety', 'infrastructure', 'morale'];
  metrics.forEach(metric => {
    const value = clamp(gameState.metrics[metric], 0, 100);
    document.getElementById(`${metric}Value`).textContent = roundValue(value);
    document.getElementById(`${metric}Meter`).style.width = value + '%';
  });

  // Resource Points (not a percentage)
  const rpValue = gameState.metrics.resourcePoints;
  document.getElementById('resourceValue').textContent = roundValue(rpValue);
  const rpPercent = Math.min(100, (rpValue / 100) * 100);
  document.getElementById('resourceMeter').style.width = rpPercent + '%';
}

/**
 * Update round counter display
 */
function updateRoundDisplay() {
  document.getElementById('roundDisplay').textContent = gameState.currentRound;
}

/**
 * Render action buttons dynamically
 */
function renderActions() {
  const actionsGrid = document.getElementById('actionsGrid');
  actionsGrid.innerHTML = '';

  gameState.gameData.actions.forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.innerHTML = `
      <div class="action-btn-title">${action.title[gameState.currentLanguage]}</div>
    `;

    btn.addEventListener('click', () => {
      // Check if player has enough resources (cost is negative resourcePoints effect)
      const cost = Math.abs(action.effects.resourcePoints || 0);
      if (cost > gameState.metrics.resourcePoints) {
        alert(`Not enough Resource Points! Need ${cost}, have ${roundValue(gameState.metrics.resourcePoints)}.`);
        return;
      }

      executeAction(action);
    });

    actionsGrid.appendChild(btn);
  });
}

/**
 * Display event card
 */
function displayEvent() {
  const event = gameState.currentEvent;
  const lang = gameState.currentLanguage;

  document.getElementById('eventTitle').textContent = event.title[lang];
  document.getElementById('eventDescription').textContent = event.description[lang];

  // Display effects as badges
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

/**
 * Show flood safety tip
 */
function showTip() {
  const event = gameState.currentEvent;
  const lang = gameState.currentLanguage;

  const tipText = document.getElementById('tipText');
  tipText.textContent = event.tip[lang];

  openModal('tipModal');
}

/**
 * Open modal dialog
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('active');
}

/**
 * Close modal dialog
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('active');
}

/**
 * Close modals when clicking outside
 */
document.addEventListener('click', (e) => {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});
