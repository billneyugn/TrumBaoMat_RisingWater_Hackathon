# Rising Waters: Flood Crisis Simulator

A strategic web-based simulation game where players lead a community through flood crisis management scenarios.

## 🎮 Game Overview

**Rising Waters** is an educational simulation game that puts players in the role of a community leader during flood crises. Make strategic decisions to protect your community while managing limited resources across 8 challenging rounds.

### Key Features
- **3 Unique Scenarios**: Central Highlands, Hanoi Lowlands, and Mekong Delta
- **Strategic Gameplay**: Balance Safety, Infrastructure, Morale, and Resource Points
- **Educational Content**: Learn real-world flood management strategies
- **Modern UI**: Clean, responsive design with ocean wave animations

## 🚀 Quick Start

### Option 1: Play Online (Recommended)
**Live Demo**: [Play Rising Waters](https://yourusername.github.io/your-repo-name) *(replace with your deployed URL)*

### Option 2: Local Development
**Prerequisites:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (Python, Node.js, or any HTTP server)

**Setup:**
1. **Clone or Download** the project files
2. **Navigate** to the `game_app` directory
3. **Start a local server**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if you have http-server installed)
   npx http-server -p 8000
   ```
4. **Open** `http://localhost:8000` in your browser (automatically redirects to menu)

### Option 3: Deploy to GitHub Pages
**One-Click Deployment:**
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Your game will be live at `https://yourusername.github.io/your-repo-name`

**See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.**

## 📁 Project Structure

```
game_submission/
├── README.md                    # This file
├── prompts/                     # AI development prompts
│   ├── concept_prompts.txt      # Game concept and brainstorming
│   ├── asset_generation_prompts.txt  # Visual design prompts
│   ├── code_generation_prompts.txt   # Game logic prompts
│   └── refinement_prompts.txt   # Debugging and polish prompts
└── game_app/                    # Complete web game
    ├── main.html                # Main menu (entry point)
    ├── index.html               # Main game interface
    ├── css/                     # Stylesheets
    │   ├── game-styles.css      # Main game styling
    │   └── main-menu.css        # Menu styling with ocean waves
    ├── js/                      # JavaScript modules
    │   ├── game-utils.js        # Utility functions
    │   ├── game-engine.js       # Core game logic
    │   ├── game-ui.js           # UI rendering
    │   └── main-menu.js         # Menu functionality
    └── gameData/                # Regional scenario data
        ├── central_highlands.json
        ├── hanoi_lowlands.json
        └── mekong_detal.json
```

## 🎯 How to Play

### Game Objective
Survive 8 rounds of flood crisis while maintaining:
- **Safety ≥ 70%**
- **Infrastructure ≥ 60%**

### Gameplay Flow
1. **Select Scenario**: Choose from 3 regional scenarios
2. **Analyze Events**: Read event cards carefully
3. **Make Decisions**: Choose actions that balance all metrics
4. **Manage Resources**: Allocate Resource Points strategically
5. **Monitor Progress**: Track your community's status
6. **Answer Quizzes**: Gain bonus points through safety questions

### Metrics to Manage
- **Safety**: Community protection level
- **Infrastructure**: Roads, buildings, utilities
- **Morale**: Community spirit and cooperation
- **Resource Points**: Available funds for actions

## 🌊 Available Scenarios

### Central Highlands
- **Challenge**: Persistent floods affecting infrastructure and agriculture
- **Focus**: Long-term infrastructure protection and community resilience
- **Difficulty**: Moderate

### Hanoi Lowlands
- **Challenge**: Rapid urban flooding with infrastructure challenges
- **Focus**: Emergency response and urban planning coordination
- **Difficulty**: Hard

### Mekong Delta
- **Challenge**: Seasonal flooding with agricultural management
- **Focus**: Balance farming needs with flood protection
- **Difficulty**: Moderate

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Game structure and content
- **CSS3**: Styling with animations and responsive design
- **JavaScript (ES6+)**: Game logic and interactivity
- **SVG**: Ocean wave animations
- **LocalStorage**: Scenario selection persistence

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- **File Size**: ~50KB total
- **Load Time**: <2 seconds on modern browsers
- **Memory Usage**: Minimal (<10MB)

## 🎨 Design Features

### Visual Design
- **Clean Interface**: Minimalist, professional design
- **Ocean Theme**: Subtle wave animations matching flood theme
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Accessibility**: High contrast, keyboard navigation support

### Color Scheme
- **Primary**: Google Material Design blue (#1976d2)
- **Secondary**: Orange accents (#ff7043)
- **Success**: Green (#4caf50)
- **Warning**: Orange (#ff9800)
- **Typography**: Orbitron monospace font

## 📚 Educational Value

This game teaches players about:
- **Flood Management**: Real-world strategies and challenges
- **Resource Allocation**: Balancing competing priorities
- **Crisis Leadership**: Decision-making under pressure
- **Community Resilience**: Building sustainable protection systems

## 🔧 Customization

### Adding New Scenarios
1. Create a new JSON file in `gameData/` directory
2. Follow the existing structure with events, actions, and i18n
3. Update `main-menu.js` to include the new scenario option

### Modifying Game Balance
- Edit metric thresholds in `game-engine.js`
- Adjust action costs in scenario JSON files
- Modify event effects for different difficulty levels

## 📄 License

This project is created for educational purposes. Feel free to use, modify, and distribute for learning and teaching flood management concepts.

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional scenarios and regions
- Enhanced animations and effects
- Multiplayer functionality
- Mobile app version
- Accessibility improvements

## 📞 Support

For questions or issues:
1. Check the browser console for error messages
2. Ensure you're using a modern browser
3. Verify the local server is running correctly
4. Try refreshing the page or clearing browser cache

---

**Enjoy playing Rising Waters and learning about flood crisis management!** 🌊