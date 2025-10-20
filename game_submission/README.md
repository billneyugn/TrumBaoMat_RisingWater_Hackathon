# 🌊 Rising Waters: Solo Survival (Vietnam Edition)

**An Educational Flood Preparedness Board Game**

## 📖 Overview

Rising Waters is an interactive web-based educational game that teaches flood preparedness and community resilience through strategic gameplay. Players take on the role of a Community Leader managing a small Vietnamese town during flood season, making critical decisions that affect the safety and well-being of their community.

## 🎮 Game Features

- **8-round gameplay** (~10 minutes per session)
- **4 dynamic metrics**: Safety, Infrastructure, Morale, Resource Points
- **9 strategic actions** with varying costs and effects
- **8 randomized flood events** with rotating deck
- **Bilingual support**: English & Vietnamese
- **Educational quizzes** with real flood safety tips
- **Three strategic paths**: Prepare, Defend, Recover
- **Responsive design** for desktop, tablet, and mobile

## 🚀 Quick Start

### Option 1: Direct Play (Recommended)
1. Navigate to the `game_app/` folder
2. Double-click `index.html`
3. The game will open in your web browser
4. Start playing immediately!

### Option 2: Local Server
1. Open terminal/command prompt in the `game_app/` folder
2. Run: `python -m http.server 8000`
3. Visit: `http://localhost:8000`

### Option 3: Online Hosting
1. Upload all files in `game_app/` to your web server
2. Share the URL with others
3. Works completely offline once loaded

## 📁 Project Structure

```
game_submission/
├── README.md                    # This file - project overview and instructions
├── prompts/                     # AI prompts used during development
│   ├── concept_prompts.txt      # Game concept and brainstorming prompts
│   ├── asset_generation_prompts.txt  # Visual design and UI prompts
│   ├── code_generation_prompts.txt   # Game logic and architecture prompts
│   └── refinement_prompts.txt   # Debugging and polish prompts
└── game_app/                    # Complete, playable web game
    ├── index.html               # Main game file (open this to play!)
    ├── gameData.json            # All game content and translations
    ├── css/                     # Stylesheets
    │   └── game-styles.css      # Complete styling and animations
    └── js/                      # JavaScript files
        ├── game-utils.js        # Utility functions
        ├── game-engine.js       # Core game logic
        ├── game-legacy.js       # Original monolithic game logic
        └── game-ui.js           # UI rendering functions
```

## 🎯 How to Play

### Objective
Keep your community safe during flood season by maintaining:
- **Safety ≥ 70%** (protects citizens from harm)
- **Infrastructure ≥ 60%** (maintains roads, dikes, buildings)

### Gameplay Loop
1. **Draw Event** - A flood-related challenge appears
2. **Choose Action** - Select from 9 strategic options
3. **See Results** - Watch metrics change based on your choice
4. **Learn** - Read real flood safety tips
5. **Quiz** - Answer questions for bonus Resource Points (+2 RP)

### Strategies
- **Prepare**: Invest early in dikes and community awareness
- **Defend**: React quickly when floods hit with evacuation and rescue
- **Recover**: Rebuild infrastructure and restore community morale

## 🛠️ Technical Details

### Technology Stack
- **HTML5** - Semantic structure and accessibility
- **CSS3** - Modern styling, animations, responsive design
- **Vanilla JavaScript** - No frameworks, 100% client-side
- **JSON** - Game data and localization

### System Requirements
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Platforms**: Windows, macOS, Linux, iOS, Android
- **Storage**: ~70 KB total (all files)
- **Internet**: Not required (works 100% offline)

### File Sizes
- `index.html`: ~6 KB
- `game-styles.css`: ~12 KB  
- `game-legacy.js`: ~16 KB (original monolithic version)
- `game-utils.js`, `game-engine.js`, `game-ui.js`: ~6 KB total (modular version)
- `gameData.json`: ~25 KB

## 🌐 Localization

The game supports two languages with complete translations:

### English (EN)
- Default language
- Full localization of all content
- Culturally appropriate scenarios

### Vietnamese (VI)  
- Complete Vietnamese translation
- Game title: "Nước Dâng Cao: Sống Sót Một Mình"
- Localized flood scenarios and terminology

Switch languages anytime using the language buttons in the top-right corner.

## 📚 Educational Value

This game teaches:

### Flood Preparedness
- Early warning response systems
- Evacuation planning and execution
- Dike maintenance and reinforcement
- Resource allocation strategies

### Community Resilience
- Leadership under crisis conditions
- Public morale management
- Infrastructure recovery priorities
- Intersectoral coordination

### Risk Management
- Budget constraints and trade-offs
- Long-term vs. short-term planning
- Consequence analysis
- Decision-making under pressure

### Cultural Context
- Vietnam-specific flood risks
- Local disaster management practices
- Community-centered approaches
- ASEAN disaster management guidelines

## 🎓 Learning Outcomes

After playing, users will understand:
1. **Flood Risk Factors** - Heavy rainfall, dike failures, disease outbreaks
2. **Preparedness Strategies** - Early investment in safety measures
3. **Crisis Response** - Evacuation procedures and rescue coordination
4. **Recovery Priorities** - Infrastructure repair and community support
5. **Resource Management** - Budget constraints and opportunity costs

## 🔧 Customization & Extension

### Easy Modifications
Edit `gameData.json` to:
- Add/remove events and actions
- Modify costs and effects
- Change win conditions
- Add new languages
- Adjust starting metrics

### Code Structure
The game uses modular JavaScript architecture:
- `game-utils.js` - Utility functions (no dependencies)
- `game-engine.js` - Core game logic (depends on utils)
- `game-ui.js` - Rendering functions (depends on utils and engine)

### Adding Content
- **New Events**: Add objects to the `events` array
- **New Actions**: Add objects to the `actions` array  
- **New Languages**: Add keys to the `i18n` object
- **New Quizzes**: Include quiz objects in event data

## 🐛 Troubleshooting

### Common Issues

**Game won't load?**
- Ensure all files are in the same folder (`game_app/`)
- Check that `gameData.json` is present and valid
- Try refreshing the page (F5 or Ctrl+R)

**Language switching not working?**
- Refresh the page and try again
- Check browser console for errors (F12)

**Buttons not responding?**
- Verify all JavaScript files are loaded
- Check browser console for error messages
- Ensure you're using a modern browser

**Mobile issues?**
- Try landscape orientation
- Use pinch-to-zoom if needed
- Ensure touch events are enabled

### Performance Issues
- Clear browser cache
- Close other browser tabs
- Restart browser if needed
- Check available memory

## 📄 License & Credits

**Educational Game** - Community Leadership Edition  
Designed for Vietnamese flood-resilience education.

Based on guidelines from:
- Vietnamese Ministry of Natural Resources & Environment
- Red Cross International
- ASEAN Disaster Management Center

## 🤝 Contributing

### For Educators
- Use in classrooms and community settings
- Share with students and colleagues
- Provide feedback on educational effectiveness
- Suggest improvements for learning outcomes

### For Developers
- Fork the project and make improvements
- Add new features or fix bugs
- Improve accessibility and performance
- Add support for additional languages

### For Community Leaders
- Use for community training sessions
- Adapt scenarios for local contexts
- Share experiences and best practices
- Provide feedback on cultural accuracy

## 📞 Support

For questions, feedback, or support:
1. Check the troubleshooting section above
2. Review the game's Help menu
3. Examine the prompts in the `prompts/` folder for development context
4. Test different strategies to understand game mechanics

## 🎉 Ready to Play!

Navigate to the `game_app/` folder and double-click `index.html` to start your journey as a Community Leader!

**Good luck, and may your community stay safe during the flood season!** 🌊💪

---

*Game Version: 1.0 (Full Release)*  
*Platform: Web (HTML5)*  
*Languages: English, Vietnamese*  
*Status: Complete & Ready ✅*
