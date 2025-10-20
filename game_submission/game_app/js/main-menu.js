// ====================================
// MAIN MENU - Navigation & Modals
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    initializeMainMenu();
});

function initializeMainMenu() {
    // Button event listeners
    document.getElementById('howToPlayBtn').addEventListener('click', showHowToPlay);
    document.getElementById('startBtn').addEventListener('click', showScenarioSelection);
    document.getElementById('gameInfoBtn').addEventListener('click', showGameInfo);
}

function showHowToPlay() {
    Swal.fire({
        title: 'How to Play',
        html: `
            <div style="font-family: 'Orbitron', monospace;">
                <div class="info-card">
                    <h4>OBJECTIVE</h4>
                    <p>Lead your community through 8 rounds of flood crisis. Maintain Safety ≥ 70% and Infrastructure ≥ 60% to achieve victory!</p>
                </div>
                
                <div class="info-card">
                    <h4>GAMEPLAY</h4>
                    <ul>
                        <li>Analyze each event card carefully</li>
                        <li>Make strategic decisions to balance resources</li>
                        <li>Monitor Safety, Infrastructure, Morale, and Resource Points</li>
                        <li>Answer quiz questions to gain bonus points</li>
                    </ul>
                </div>
                
                <div class="info-card">
                    <h4>STRATEGY TIPS</h4>
                    <ul>
                        <li>Plan ahead for future challenges</li>
                        <li>Balance immediate needs with long-term stability</li>
                        <li>Allocate Resource Points strategically</li>
                    </ul>
                </div>
            </div>
        `,
        icon: 'info',
        iconColor: '#1976d2',
        showConfirmButton: false,
        showCancelButton: false,
        showCloseButton: true,
        customClass: {
            popup: 'swal2-popup'
        }
    });
}

function showGameInfo() {
    Swal.fire({
        title: 'Game Information',
        html: `
            <div style="font-family: 'Orbitron', monospace;">
                <div class="info-card">
                    <h4>ABOUT RISING WATERS</h4>
                    <p>A strategic simulation game where you lead a community through flood crisis management. Experience real-world scenarios based on Vietnam's diverse regions.</p>
                </div>
                
                <div class="info-card">
                    <h4>AVAILABLE SCENARIOS</h4>
                    <ul>
                        <li><strong>Central Highlands:</strong> Persistent floods affecting infrastructure and agriculture</li>
                        <li><strong>Hanoi Lowlands:</strong> Rapid urban flooding with emergency response challenges</li>
                        <li><strong>Mekong Delta:</strong> Seasonal flooding with agricultural management focus</li>
                    </ul>
                </div>
                
                <div class="info-card">
                    <h4>LEARNING OBJECTIVES</h4>
                    <ul>
                        <li>Master flood management strategies</li>
                        <li>Develop community resilience planning</li>
                        <li>Enhance resource allocation skills</li>
                        <li>Understand emergency response protocols</li>
                    </ul>
                </div>
            </div>
        `,
        icon: 'info',
        iconColor: '#1976d2',
        showConfirmButton: false,
        showCancelButton: false,
        showCloseButton: true,
        customClass: {
            popup: 'swal2-popup'
        }
    });
}

function showScenarioSelection() {
    Swal.fire({
        title: 'Choose Your Scenario',
        html: `
            <div style="font-family: 'Orbitron', monospace;">
                <p style="margin-bottom: 20px; text-align: center; color: #6b7280; font-size: 0.875rem;">Select a region to experience unique flood management challenges:</p>
                
                <div class="scenario-card" onclick="selectScenario('central_highlands')">
                    <div class="scenario-card-title">CENTRAL HIGHLANDS</div>
                    <div class="scenario-card-desc">Persistent floods affecting roads and agriculture. Focus on long-term infrastructure protection and community resilience.</div>
                </div>
                
                <div class="scenario-card" onclick="selectScenario('hanoi_lowlands')">
                    <div class="scenario-card-title">HANOI LOWLANDS</div>
                    <div class="scenario-card-desc">Rapid urban flooding with infrastructure challenges. Manage emergency response and urban planning coordination.</div>
                </div>
                
                <div class="scenario-card" onclick="selectScenario('mekong_detal')">
                    <div class="scenario-card-title">MEKONG DELTA</div>
                    <div class="scenario-card-desc">Seasonal flooding with agricultural focus. Balance farming needs with flood protection strategies.</div>
                </div>
            </div>
        `,
        icon: 'question',
        iconColor: '#1976d2',
        showConfirmButton: false,
        showCancelButton: false,
        showCloseButton: true,
        customClass: {
            popup: 'swal2-popup'
        }
    });
}

function selectScenario(scenario) {
    Swal.close();
    
    // Show loading message
    Swal.fire({
        title: 'Loading Game...',
        text: 'Preparing your scenario...',
        icon: 'info',
        iconColor: '#1976d2',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
            popup: 'swal2-popup'
        }
    });
    
    // Store selected scenario and redirect to game
    localStorage.setItem('selectedScenario', scenario);
    
    // Redirect to game page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Add SweetAlert2 custom styles
const style = document.createElement('style');
style.textContent = `
    .swal2-popup-orbitron {
        font-family: 'Orbitron', monospace !important;
    }
    
    .swal2-popup-orbitron .swal2-title {
        font-family: 'Orbitron', monospace !important;
        font-weight: 700 !important;
    }
    
    .swal2-popup-orbitron .swal2-content {
        font-family: 'Orbitron', monospace !important;
    }
    
    .swal2-popup-orbitron .swal2-confirm,
    .swal2-popup-orbitron .swal2-cancel {
        font-family: 'Orbitron', monospace !important;
        font-weight: 600 !important;
    }
`;
document.head.appendChild(style);
