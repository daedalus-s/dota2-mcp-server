# 🎮 Dota 2 MCP Server

A powerful Model Context Protocol (MCP) server for Dota 2 opponent analysis and drafting assistance. Integrates seamlessly with Claude Desktop to provide real-time player insights, hero statistics, and strategic recommendations.

![Dota 2 MCP Server](https://img.shields.io/badge/MCP-Server-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) ![OpenDota](https://img.shields.io/badge/OpenDota-API-red)

## ✨ Features

### 🔍 **Player Analysis**
- **Player Search**: Find any Dota 2 player by Steam name
- **Hero Statistics**: Analyze most played and most effective heroes
- **Match History**: Review recent performance and trends
- **Ability Builds**: Understand skill build patterns for specific heroes

### ⚔️ **Strategic Intelligence**
- **Hero Matchup Analysis**: Identify counters and favorable matchups
- **Item Build Analysis**: Decode farming vs fighting build preferences
- **Draft Suggestions**: AI-powered pick recommendations based on team composition
- **Meta Insights**: Current patch statistics and win rates

### 🎯 **Competitive Advantages**
- **Real-time opponent scouting** during draft phase
- **Data-driven pick/ban decisions**
- **Playstyle pattern recognition**
- **Team composition optimization**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Claude Desktop application
- Internet connection (for OpenDota API)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/daedalus-s/dota2-mcp-server.git
   cd dota2-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Configure Claude Desktop**
   
   Add to your `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "dota2-mcp-server": {
         "command": "node",
         "args": ["/absolute/path/to/dota2-mcp-server/dist/index.js"],
         "env": {}
       }
     }
   }
   ```

   **Config file locations:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

5. **Restart Claude Desktop**

## 📖 Usage

### Basic Commands

#### Player Research
```
Search for Dota 2 player named "miracle"
```

#### Hero Analysis
```
Get most played heroes for account ID 105248644 or account name "miracle"
```

#### Draft Strategy
```
Suggest draft picks with ally heroes Anti-Mage and Invoker and enemy heroes vengeful Spirit and Juggernaut
```

#### Matchup Intelligence
```
Get hero matchups for Axe
```

#### Build Analysis
```
Get item builds for account ID 105248644 or account name Pr1m3vAL playing Bloodseeker
```

### Workflow Example

1. **Scout Phase**: Research opponent's Steam profile
2. **Ban Phase**: Analyze their best heroes and consider bans
3. **Pick Phase**: Get AI recommendations based on draft state
4. **Counter Phase**: Check matchup data for picked heroes
5. **Build Prediction**: Understand their itemization patterns

## 🛠️ Available Tools

| Tool | Description | Usage |
|------|-------------|-------|
| `search_player` | Find player by Steam name | Opponent scouting |
| `get_player_heroes` | Most played/effective heroes | Hero pool analysis |
| `get_hero_ability_builds` | Skill build patterns | Playstyle prediction |
| `get_player_recent_matches` | Performance trends | Form assessment |
| `get_hero_matchups` | Counter/synergy data | Pick/ban strategy |
| `get_item_builds` | Itemization analysis | Build prediction |
| `suggest_draft_picks` | AI pick recommendations | Draft optimization |
| `get_heroes` | Hero ID reference | Data lookup |
| `get_items` | Item ID reference | Build analysis |

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Claude Desktop │────│  MCP Protocol    │────│  Dota 2 Server  │
│                 │    │                  │    │                 │
│  Natural Language│    │  Tool Execution  │    │  OpenDota API   │
│  Queries        │    │  Data Processing │    │  Data Fetching  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

The server acts as a bridge between Claude Desktop and the OpenDota API, providing natural language access to complex Dota 2 analytics.

## 🎯 Use Cases

### **Competitive Teams**
- Pre-match opponent analysis
- Draft preparation and strategy
- Meta trend identification
- Player weakness exploitation

### **Individual Players**
- Ranked matchmaking insights
- Hero mastery tracking
- Build optimization
- Counter-pick knowledge

### **Coaches & Analysts**
- Team performance analysis
- Strategic planning
- Player development insights
- Tournament preparation

## 🔧 Development

### Project Structure
```
dota2-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm start  # Test server startup
```

## 📊 Data Sources

- **OpenDota API**: Public match data, player statistics, hero information
- **Real-time Data**: Live match statistics and current meta trends
- **Historical Analysis**: Long-term performance patterns and trends

## 🤝 Contributing

Contributions are welcome! Here are some areas for improvement:

- **Additional APIs**: Steam Web API integration for live matches
- **Machine Learning**: Win probability predictions
- **UI Enhancements**: Rich formatting and visualizations
- **Performance**: Caching and optimization
- **Features**: Tournament analysis, team coordination tools

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**"MCP server not found"**
- Verify the path in `claude_desktop_config.json`
- Ensure the project was built successfully
- Restart Claude Desktop completely

**"Module not found" errors**
- Run `npm install` to reinstall dependencies
- Check Node.js version (requires 18+)

**API request failures**
- Check internet connection
- OpenDota API might be temporarily down
- Some player profiles might be private

**Item/Hero IDs not resolving**
- The server caches data on first use
- Restart if seeing "ID NaN" or missing names

### Debug Mode
Run the server standalone to check for errors:
```bash
node dist/index.js
```

## 📈 Roadmap

### Version 2.0
- [ ] Live match integration
- [ ] Tournament bracket analysis
- [ ] Team performance tracking
- [ ] Machine learning predictions

### Version 2.5
- [ ] Voice command integration
- [ ] Discord/Slack bot
- [ ] Mobile notifications
- [ ] Custom coaching insights

### Version 3.0
- [ ] Professional match analysis
- [ ] Replay parsing
- [ ] Advanced statistics
- [ ] Social features

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenDota** for providing free access to Dota 2 data
- **Anthropic** for the MCP framework and Claude Desktop
- **Valve Corporation** for Dota 2
- **The Dota 2 community** for feedback and suggestions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/dota2-mcp-server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dota2-mcp-server/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/dota2-mcp-server/wiki)

---

**⚡ Give your team the competitive edge with data-driven Dota 2 insights!**

*Built with ❤️ for the Dota 2 community*
