# 🎮 Dota 2 MCP Server

A comprehensive Model Context Protocol (MCP) server that integrates Claude Desktop with advanced Dota 2 analytics. Provides intelligent player analysis, strategic draft assistance, and real-time meta insights using the OpenDota API.

![Dota 2 MCP Server](https://img.shields.io/badge/MCP-Server-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) ![OpenDota](https://img.shields.io/badge/OpenDota-API-red) ![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🚀 Key Features

### 🔍 **Advanced Player Analytics**
- **Comprehensive player search** and profile analysis by Steam name
- **Statistical performance tracking** with automated pattern detection
- **Behavioral analysis algorithms** that identify gameplay tendencies
- **Win rate correlation analysis** across different game contexts
- **Make sure you ask it really complex questions that would give you a real edge over your opponent as well as test the capabilities of the application.

### ⚔️ **Strategic Intelligence System**
- **Complete hero and item databases** with normalized naming conventions
- **Matchup analysis engine** with statistical significance testing
- **Build pattern recognition** using machine learning on match data
- **Skill progression modeling** from large-scale dataset analysis

### 🧠 **AI-Enhanced Draft Tools**
- **Context-aware draft recommendations** based on team composition analysis
- **Multi-bracket meta analysis** with real-time statistical updates
- **Performance pattern algorithms** for opponent weakness identification
- **Evidence-based counter-pick suggestions** with confidence scoring

### 📊 **Real-Time Meta Intelligence**
- **Patch-specific trend analysis** across all skill brackets
- **Professional scene analytics** including tournament pick/ban data
- **Role-based performance metrics** with statistical breakdowns
- **Dynamic meta shift detection** and trend forecasting

## ⚡ Installation & Setup

Integrate advanced Dota 2 analytics with Claude Desktop in minutes.

### System Requirements
- Node.js 18+ for optimal performance ⚙️
- Claude Desktop application 🤖
- Stable internet connection for API access 🌐

### Installation Process

1. **Repository Setup:**
   ```bash
   git clone https://github.com/daedalus-s/dota2-mcp-server.git
   cd dota2-mcp-server
   npm install
   npm run build
   ```

2. **Claude Desktop Configuration:**
   
   Configure the MCP server in your Claude Desktop settings:

   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   
   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

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

3. **Activation:** Restart Claude Desktop to enable the integration 🎯

## 💬 Usage Examples

Execute sophisticated analysis through natural language queries in Claude Desktop:

### 🕵️ **Player Intelligence Analysis**
```
Search for Dota 2 player named "miracle"
→ Comprehensive profile with performance metrics and behavioral patterns

Get most played heroes for "miracle"
→ Hero pool analysis with statistical confidence intervals

Analyze performance patterns for "dendi"
→ Advanced pattern detection with actionable insights
```

### 🎯 **Strategic Analysis Operations**
```
Get hero matchups for Juggernaut
→ Complete matchup matrix with win rate correlations

Get meta analysis for divine rank bracket 
→ Current meta statistics with trend analysis

Suggest draft picks with ally heroes Pudge and Invoker and enemy heroes Slark and Crystal Maiden
→ AI-generated recommendations with strategic reasoning
```

### 🛡️ **Build Intelligence Extraction**
```
Get item builds for account name Pr1m3vAL playing Axe
→ Build pattern analysis with playstyle classification

Get hero ability builds for account name Ana playing Io
→ Skill progression analysis with timing optimization
```

## 🔧 Comprehensive Tool Suite

| Tool | Technical Capability | Implementation Focus |
|------|---------------------|---------------------|
| `search_player` | **Player profile resolution** | Steam API integration with data normalization |
| `get_player_heroes` | **Statistical hero analysis** | Win rate calculation with confidence intervals |
| `analyze_performance_patterns` | **🧠 ML pattern detection** | Behavioral modeling with trend analysis |
| `get_meta_analysis` | **🔮 Meta intelligence engine** | Real-time statistical aggregation across brackets |
| `suggest_draft_picks` | **🤖 AI recommendation system** | Multi-factor optimization with reasoning engine |
| `get_hero_matchups` | **⚔️ Matchup correlation matrix** | Statistical significance testing on large datasets |
| `get_item_builds` | **🔍 Build pattern classifier** | Machine learning on itemization sequences |
| `get_hero_ability_builds` | **📊 Skill progression analyzer** | Temporal analysis of ability selection patterns |
| `get_heroes` / `get_items` | **📚 Reference databases** | Normalized data structures with ID mapping |

## 🌐 Technical Architecture & Data Infrastructure

### ⚡ **Data Pipeline Architecture**
- **OpenDota API Integration** - Enterprise-grade REST API with comprehensive match databases
- **Real-Time Statistical Processing** - Live aggregation across all skill brackets with temporal analysis
- **Large-Scale Pattern Recognition** - Machine learning algorithms trained on millions of match records
- **Intelligent Caching Layer** - Optimized data retrieval with automatic cache invalidation

### 🏗️ **Technical Implementation**
- **TypeScript** - Strongly typed codebase with comprehensive error handling
- **Model Context Protocol** - Native Claude Desktop integration with seamless tool execution
- **Node.js Runtime** - Cross-platform compatibility with asynchronous processing
- **Modular Architecture** - Extensible design with clear separation of concerns

### 📊 **Data Processing Features**
- **Statistical Significance Testing** - Confidence intervals and sample size validation
- **Temporal Analysis** - Time-series pattern detection for meta trends
- **Multi-Dimensional Correlation** - Complex relationship modeling between game variables
- **Real-Time Data Synchronization** - Live updates reflecting current game state

**🔓 Open Architecture:** Public API access with no authentication requirements, ensuring reliability and accessibility.

## ⚙️ Advanced Configuration

### 🎯 **Analysis Depth Configuration**
Configurable analysis granularity for performance optimization:
- `basic` - Lightweight analysis for rapid data retrieval
- `detailed` - Standard comprehensive analysis with pattern detection (default)
- `comprehensive` - Full statistical modeling including contextual variables

### 🏆 **Meta Analysis Parameters**
Targeted analysis with configurable scope:
- **Rank Brackets:** Granular targeting from `herald` through `immortal` to `pro`
- **Analysis Focus:** Specialized views including `overview`, `trending`, `winrates`, `pickrates`

### 💻 **Advanced Query Examples**
```bash
# Deep statistical analysis with comprehensive pattern detection
Analyze performance patterns for account : Pr1m3vAL with analysis depth comprehensive

# Real-time meta intelligence for high-skill brackets
Get meta analysis for rank bracket immortal with focus trending

# Targeted win rate analysis for strategic planning
Get meta analysis for rank bracket divine with focus winrates
```

## Development

### Project Structure
```
dota2-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## Troubleshooting

### Server Not Recognized
- Verify the absolute path in the Claude Desktop configuration
- Ensure the project has been built successfully (`npm run build`)
- Restart Claude Desktop completely

### Module Errors
- Run `npm install` to reinstall dependencies
- Check Node.js version (requires 18+)

### API Failures
- Check internet connection
- OpenDota API may be temporarily unavailable
- Some player profiles may be private

### Data Issues
- Hero/item names not showing: The server caches data on first use
- Restart if seeing incomplete information

## 🤝 Contributing to the Project

Contributions from developers and Dota 2 enthusiasts is welcomed. This project benefits from community involvement in advancing analytical capabilities and improving technical implementation.

### 🚀 **Development Workflow**
1. **Fork** the repository and create a development branch
2. **Implement** features following TypeScript best practices
3. **Test** thoroughly with comprehensive error handling
4. **Submit** pull requests with detailed technical documentation

### 🎯 **Priority Development Areas**
- **🔬 Advanced Analytics** - Enhanced statistical models and pattern recognition algorithms
- **⚡ Performance Optimization** - Improved data processing efficiency and caching strategies
- **🎨 Data Visualization** - Enhanced output formatting and structured data presentation
- **🛡️ Error Handling** - Robust exception management and graceful degradation

### 📋 **Technical Standards**
- Follow established TypeScript conventions and type safety practices
- Implement comprehensive error handling for API interactions
- Include unit tests for new analytical functions
- Document complex algorithms and data processing logic

*Contributions help advance the state of Dota 2 analytics and benefit the broader gaming community.*

## 📈 Performance & Results

**⚡ Efficient Setup** → **🧠 Advanced Analytics** → **🎯 Strategic Advantage** → **📊 Improved Performance**

Transform draft decision-making from intuition-based to data-driven analysis with comprehensive statistical backing.

---

*Developed by Dota 2 players with love for the community.*

---

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- **OpenDota** for comprehensive match data API access
- **Anthropic** for Model Context Protocol framework development  
- **Valve Corporation** for Dota 2 and public match data availability

**Disclaimer:** This tool provides statistical analysis based on publicly available match data. Individual results may vary based on implementation and usage patterns. Dota 2 is a trademark of Valve Corporation.
