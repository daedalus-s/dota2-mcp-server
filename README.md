# 🎮 Dota 2 Smart Assistant

Transform Claude Desktop into your personal Dota 2 coach! Get instant insights about players, smart draft suggestions, and never lose a game to poor hero picks again.

![Dota 2 Smart Assistant](https://img.shields.io/badge/Dota%202-Smart%20Assistant-blue) ![Easy Setup](https://img.shields.io/badge/Setup-5%20Minutes-green) ![Free](https://img.shields.io/badge/100%25-Free-brightgreen) ![Works Offline](https://img.shields.io/badge/Works-Offline-orange)

## 🤔 What Does This Do?

Ever wondered "Who is this player?" or "What hero should I pick?" during a Dota 2 match? This tool gives you instant answers using AI!

### **Before** 
- Picking heroes randomly and hoping for the best
- Getting countered by opponents you know nothing about
- Losing games because of poor draft decisions
- Wondering why some heroes work better than others

### **After** 
- Know your opponents' favorite heroes before the game starts
- Get smart pick suggestions based on what the enemy team chose
- Understand which heroes work best in the current patch
- Make informed decisions instead of guessing

## ✨ What Can It Do?

### 🔍 **Player Detective**
```
"Search for Dota 2 player named Miracle"
```
**You Get:** Their favorite heroes, win rates, recent performance, and play style

### 🧠 **Smart Draft Helper**
```
"Suggest heroes for my team. Enemy picked Pudge and Invoker"
```
**You Get:** Perfect counter-picks with explanations why they work

### 📈 **What's Strong Right Now**
```
"What heroes are strong in Divine rank?"
```
**You Get:** Current meta heroes, win rates, and what to avoid

### 🎯 **Counter-Pick Master**
```
"What heroes counter Invoker?"
```
**You Get:** Best counters with win percentage data

### 🛡️ **Build Predictor**
```
"How does this player build Juggernaut?"
```
**You Get:** Their typical item choices and whether they farm or fight

## 🚀 Super Easy Setup

### Step 1: Download What You Need
- [Claude Desktop](https://claude.ai/desktop) (Free)
- [Node.js](https://nodejs.org/) (Free)

### Step 2: Get The Assistant
```bash
# Copy these commands into your terminal/command prompt
git clone https://github.com/daedalus-s/dota2-mcp-server.git
cd dota2-mcp-server
npm install
npm run build
```

### Step 3: Connect to Claude
Create or edit this file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Put this inside:
```json
{
  "mcpServers": {
    "dota2-assistant": {
      "command": "node",
      "args": ["C:\\path\\to\\your\\dota2-mcp-server\\dist\\index.js"],
      "env": {}
    }
  }
}
```
*(Replace the path with where you downloaded the files)*

### Step 4: Restart Claude Desktop
Close it completely and open it again. Done! 🎉

## 🎮 How to Use It

### **During Hero Selection**
1. **Scout your enemies:**
   ```
   "Search for player named [enemy player name]"
   ```

2. **Get counter-picks:**
   ```
   "What heroes counter Pudge?"
   ```

3. **Get smart suggestions:**
   ```
   "Suggest heroes for my team. Enemy has Invoker and Anti-Mage"
   ```

### **Learning the Game**
1. **Understand the meta:**
   ```
   "What heroes are strong right now?"
   ```

2. **Learn matchups:**
   ```
   "Show me Invoker's best and worst matchups"
   ```

3. **Analyze builds:**
   ```
   "How do good players build Pudge?"
   ```

### **Improve Your Gameplay**
1. **Find your weaknesses:**
   ```
   "Analyze my performance patterns"
   ```

2. **Track your progress:**
   ```
   "Show my recent matches and performance"
   ```

## 🏆 Real Examples

### **Before a Ranked Game**
**You:** "Search for Dota 2 player named EnemyMidLaner"

**Assistant:** "Found player! They love playing Invoker (65% win rate, 50 games) and Pudge (58% win rate, 30 games). They struggle with Anti-Mage (32% win rate, 15 games). They tend to perform poorly in games longer than 45 minutes."

**You:** "What heroes counter Invoker?"

**Assistant:** "Best counters: Anti-Mage (62% win rate vs Invoker), Storm Spirit (58% win rate), and Templar Assassin (56% win rate). Anti-Mage is especially strong because Invoker struggles against mobile heroes who can close gaps quickly."

### **During Draft**
**You:** "Suggest heroes for my team. Enemy picked Invoker and Pudge, we have Crystal Maiden"

**Assistant:** "Strong picks: Anti-Mage (counters Invoker, fits with CM support), Storm Spirit (mobile vs both enemies), or Templar Assassin (good vs Invoker). Anti-Mage is recommended because the enemy lacks strong carries and you have good support."

## 🎯 Who Is This For?

### **New Players** 🌱
- Learn which heroes work well together
- Understand what makes heroes strong or weak
- Get guidance instead of random picking
- Improve faster with data-driven decisions

### **Casual Players** 🎮
- Win more games with better picks
- Understand your opponents before games start
- Learn the current meta without research
- Make informed decisions in ranked

### **Competitive Players** ⚔️
- Scout opponents in ranked matches
- Get detailed performance analysis
- Optimize your hero pool based on data
- Gain advantages through preparation

### **Dota 2 Enthusiasts** 📊
- Explore detailed statistics and trends
- Understand the professional meta
- Analyze your favorite players
- Learn advanced game concepts

## 🤖 Smart Features

### **Instant Answers**
Ask natural questions like:
- "Who should I ban against this team?"
- "What items does this player usually build?"
- "Is Pudge good in the current patch?"
- "What are my weak heroes I should avoid?"

### **Learning Mode**
The assistant explains its reasoning:
- "Pick Anti-Mage because he counters their magic-heavy lineup"
- "Avoid long games since this player excels in late game"
- "Their support player struggles with positioning - pressure early"

### **Always Up-to-Date**
- Uses live data from OpenDota
- Reflects current patch changes
- Shows real player statistics
- No outdated information

## 🔒 Privacy & Safety

- ✅ **100% Free** - No subscriptions or payments
- ✅ **No Login Required** - No personal data needed  
- ✅ **Public Data Only** - Uses publicly available match data
- ✅ **Runs Locally** - Everything processes on your computer
- ✅ **Open Source** - You can see exactly what it does

## 🆘 Need Help?

### **It is Not Working**
1. Make sure Claude Desktop is completely closed and reopened
2. Check that the file path in the config is correct
3. Try rebuilding: `npm run build`
4. Restart your computer if needed

### **Can't Find Players**
- Try the exact Steam display name
- Some players have private profiles
- Check spelling carefully

### **No Suggestions**
- Make sure you're asking clearly: "Suggest heroes for..."
- Try with specific enemy heroes: "Enemy has Pudge and Invoker"

### **Getting Errors**
- Check your internet connection
- OpenDota might be temporarily down
- Try again in a few minutes

## 🔄 What's Coming Next

### **Soon**
- ✨ Even smarter analysis
- 📱 Mobile app version
- 🎯 Personal coaching recommendations
- 📊 Beautiful charts and graphs

### **Future Ideas**
- 🎮 Integration with Dota 2 client
- 👥 Team analysis for party games
- 🏆 Tournament bracket predictions
- 📹 Replay analysis

## 🤝 Join the Community

- **Questions?** [Ask on GitHub](https://github.com/yourusername/dota2-mcp-server/discussions)
- **Found a bug?** [Report it here](https://github.com/yourusername/dota2-mcp-server/issues)
- **Want to help?** [Contribute on GitHub](https://github.com/yourusername/dota2-mcp-server)
- **Share your success!** Tell us your ranking improvements!

## 📋 Quick Commands Reference

| What You Want | What to Ask |
|---------------|-------------|
| Scout a player | `"Search for Dota 2 player named [name]"` |
| Counter-pick help | `"What heroes counter [hero name]?"` |
| Draft suggestions | `"Suggest heroes for my team. Enemy has [heroes]"` |
| Meta check | `"What heroes are strong right now?"` |
| Build analysis | `"How do players build [hero name]?"` |
| Your performance | `"Analyze my recent matches"` |
| Learn matchups | `"Show [hero name] matchup data"` |

## 🎯 Start Winning Today!

1. **5 minutes** to set up
2. **Instant** hero insights
3. **Better** draft decisions
4. **More** wins

Stop guessing and start winning with data-driven Dota 2 decisions!

---

### 🚀 Ready to Rank Up?

**[⬇️ Download Now](#super-easy-setup)** • **[❓ Get Help](#need-help)** • **[💬 Join Community](#join-the-community)**

*Made with ❤️ by a Dota 2 player, for Dota 2 players*

---

**Disclaimer:** This tool provides analysis based on public match data. Individual results may vary. Dota 2 is a trademark of Valve Corporation.