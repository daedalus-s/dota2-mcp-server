#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import fetch from 'node-fetch';

interface PlayerProfile {
  account_id: number;
  personaname: string;
  name?: string;
  plus?: boolean;
  cheese?: number;
  steamid?: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull?: string;
  profileurl?: string;
  last_login?: string;
  loccountrycode?: string;
}

interface HeroStats {
  hero_id: string;
  last_played: number;
  games: number;
  win: number;
  with_games: number;
  with_win: number;
  against_games: number;
  against_win: number;
}

interface MatchDetails {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  game_mode: number;
  lobby_type: number;
  hero_id: number;
  start_time: number;
  version: number;
  kills: number;
  deaths: number;
  assists: number;
  skill: number;
  leaver_status: number;
  party_size: number;
}

interface AbilityUpgrade {
  ability: number;
  time: number;
  level: number;
}

interface DetailedMatch {
  match_id: number;
  player_slot: number;
  ability_upgrades_arr?: AbilityUpgrade[];
  hero_id: number;
  item_0?: number;
  item_1?: number;
  item_2?: number;
  item_3?: number;
  item_4?: number;
  item_5?: number;
  kills: number;
  deaths: number;
  assists: number;
  last_hits: number;
  denies: number;
  gold_per_min: number;
  xp_per_min: number;
  level: number;
  hero_damage: number;
  tower_damage: number;
  hero_healing: number;
  radiant_win: boolean;
  start_time: number;
  duration: number;
}

interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
}

interface HeroMatchup {
  hero_id: number;
  games_played: number;
  wins: number;
}

interface ItemBuild {
  item_id: number;
  games: number;
  wins: number;
}

interface HeroStats {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  pro_pick: number;
  pro_win: number;
  pro_ban: number;
  '1_pick': number;
  '1_win': number;
  '2_pick': number;
  '2_win': number;
  '3_pick': number;
  '3_win': number;
  '4_pick': number;
  '4_win': number;
  '5_pick': number;
  '5_win': number;
  '6_pick': number;
  '6_win': number;
  '7_pick': number;
  '7_win': number;
  '8_pick': number;
  '8_win': number;
}

interface PlayerMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  game_mode: number;
  lobby_type: number;
  hero_id: number;
  start_time: number;
  version: number;
  kills: number;
  deaths: number;
  assists: number;
  skill: number;
  leaver_status: number;
  party_size: number;
  average_rank?: number;
  xp_per_min?: number;
  gold_per_min?: number;
  hero_damage?: number;
  tower_damage?: number;
  hero_healing?: number;
  last_hits?: number;
  denies?: number;
  level?: number;
}

interface PerformancePattern {
  category: string;
  pattern: string;
  confidence: number;
  sample_size: number;
  recommendation: string;
}

interface GameItem {
  id: number;
  img: string;
  dname: string;
  qual: string;
  cost?: number;
  notes?: string;
  attrib?: Array<{
    key: string;
    header: string;
    value: string;
  }>;
  mc?: boolean;
  cd?: boolean;
}

class Dota2MCPServer {
  private server: Server;
  private baseUrl = 'https://api.opendota.com/api';
  private heroesCache: Hero[] | null = null;
  private heroStatsCache: HeroStats[] | null = null;
  private itemsCache: { [key: string]: GameItem } | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'dota2-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_heroes',
          description: 'Get list of all Dota 2 heroes with their IDs and names',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'get_items',
          description: 'Get list of all Dota 2 items with their IDs and names',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'search_player',
          description: 'Search for a Dota 2 player by Steam name and get their profile information',
          inputSchema: {
            type: 'object',
            properties: {
              steam_name: {
                type: 'string',
                description: 'The Steam display name of the player to search for'
              }
            },
            required: ['steam_name']
          }
        },
        {
          name: 'search_player_by_id',
          description: 'Search for a Dota 2 player by Steam ID and get their profile information',
          inputSchema: {
            type: 'object',
            properties: {
              steam_id: {
                type: 'string',
                description: 'The Steam ID (either Steam ID 64 or Steam ID 32) of the player to search for'
              }
            },
            required: ['steam_id']
          }
        },
        {
          name: 'get_player_heroes',
          description: 'Get most played and most effective heroes for a specific player',
          inputSchema: {
            type: 'object',
            properties: {
              account_id: {
                type: 'number',
                description: 'The account ID of the player'
              }
            },
            required: ['account_id']
          }
        },
        {
          name: 'get_hero_ability_builds',
          description: 'Get average ability builds for a specific hero played by a player',
          inputSchema: {
            type: 'object',
            properties: {
              account_id: {
                type: 'number',
                description: 'The account ID of the player'
              },
              hero_id: {
                type: 'number',
                description: 'The hero ID to analyze ability builds for'
              }
            },
            required: ['account_id', 'hero_id']
          }
        },
        {
          name: 'get_player_recent_matches',
          description: 'Get recent matches for a player to analyze their performance',
          inputSchema: {
            type: 'object',
            properties: {
              account_id: {
                type: 'number',
                description: 'The account ID of the player'
              },
              limit: {
                type: 'number',
                description: 'Number of recent matches to fetch (default: 20)',
                default: 20
              }
            },
            required: ['account_id']
          }
        },
        {
          name: 'get_hero_matchups',
          description: 'Get matchup data for a specific hero - which heroes it performs best/worst against',
          inputSchema: {
            type: 'object',
            properties: {
              hero_id: {
                type: 'number',
                description: 'The hero ID to get matchup data for'
              }
            },
            required: ['hero_id']
          }
        },
        {
          name: 'get_item_builds',
          description: 'Get popular item builds for a specific hero played by a player',
          inputSchema: {
            type: 'object',
            properties: {
              account_id: {
                type: 'number',
                description: 'The account ID of the player'
              },
              hero_id: {
                type: 'number',
                description: 'The hero ID to analyze item builds for'
              }
            },
            required: ['account_id', 'hero_id']
          }
        },
        {
          name: 'suggest_draft_picks',
          description: 'Suggest hero picks based on current draft state and team composition',
          inputSchema: {
            type: 'object',
            properties: {
              ally_heroes: {
                type: 'array',
                items: { type: 'number' },
                description: 'Array of hero IDs already picked by your team'
              },
              enemy_heroes: {
                type: 'array',
                items: { type: 'number' },
                description: 'Array of hero IDs picked by enemy team'
              },
              player_account_id: {
                type: 'number',
                description: 'Account ID of the player who needs a pick (optional - for personalized suggestions)',
                default: null
              }
            },
            required: ['ally_heroes', 'enemy_heroes']
          }
        },
        {
          name: 'get_meta_analysis',
          description: 'Get current Dota 2 meta analysis including trending heroes, win rates by rank bracket, and patch insights',
          inputSchema: {
            type: 'object',
            properties: {
              rank_bracket: {
                type: 'string',
                description: 'Rank bracket to analyze (herald, guardian, crusader, archon, legend, ancient, divine, immortal, pro)',
                default: 'all'
              },
              focus: {
                type: 'string',
                description: 'Analysis focus: trending, winrates, pickrates, or overview',
                default: 'overview'
              }
            },
            required: []
          }
        },
        {
          name: 'analyze_performance_patterns',
          description: 'Analyze a players performance patterns to identify strengths, weaknesses, and improvement areas',
          inputSchema: {
            type: 'object',
            properties: {
              account_id: {
                type: 'number',
                description: 'The account ID of the player to analyze'
              },
              match_limit: {
                type: 'number',
                description: 'Number of recent matches to analyze (default: 50)',
                default: 50
              },
              analysis_depth: {
                type: 'string',
                description: 'Depth of analysis: basic, detailed, or comprehensive',
                default: 'detailed'
              }
            },
            required: ['account_id']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `No arguments provided for tool: ${name}`
        );
      }

      try {
        switch (name) {
          case 'get_heroes':
            return await this.getHeroes();
          case 'get_items':
            return await this.getItems();
          case 'search_player':
            return await this.searchPlayer(args.steam_name as string);
          case 'search_player_by_id':
            return await this.searchPlayerById(args.steam_id as string);
          case 'get_player_heroes':
            return await this.getPlayerHeroes(args.account_id as number);
          case 'get_hero_ability_builds':
            return await this.getHeroAbilityBuilds(
              args.account_id as number,
              args.hero_id as number
            );
          case 'get_player_recent_matches':
            return await this.getPlayerRecentMatches(
              args.account_id as number,
              args.limit as number || 20
            );
          case 'get_hero_matchups':
            return await this.getHeroMatchups(args.hero_id as number);
          case 'get_item_builds':
            return await this.getItemBuilds(
              args.account_id as number,
              args.hero_id as number
            );
          case 'suggest_draft_picks':
            return await this.suggestDraftPicks(
              args.ally_heroes as number[],
              args.enemy_heroes as number[],
              args.player_account_id as number || null
            );
          case 'get_meta_analysis':
            return await this.getMetaAnalysis(
              args.rank_bracket as string || 'all',
              args.focus as string || 'overview'
            );
          case 'analyze_performance_patterns':
            return await this.analyzePerformancePatterns(
              args.account_id as number,
              args.match_limit as number || 50,
              args.analysis_depth as string || 'detailed'
            );
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async apiRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async getHeroes() {
    try {
      if (!this.heroesCache) {
        this.heroesCache = await this.apiRequest('/heroes');
      }

      if (!this.heroesCache || this.heroesCache.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'Failed to load hero data from OpenDota API.'
            }
          ]
        };
      }

      let result = '🦸 ALL DOTA 2 HEROES:\n\n';
      this.heroesCache.forEach(hero => {
        result += `ID ${hero.id}: ${hero.localized_name} (${hero.name})\n`;
      });

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get heroes: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private getHeroName(heroId: number): string {
    if (!this.heroesCache) {
      return `Hero ID ${heroId}`;
    }
    
    const hero = this.heroesCache.find(h => h.id === heroId);
    return hero ? hero.localized_name : `Hero ID ${heroId}`;
  }

  private async getItems() {
    try {
      await this.ensureItemsCache();

      if (!this.itemsCache || Object.keys(this.itemsCache).length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'Failed to load item data from OpenDota API.'
            }
          ]
        };
      }

      let result = '🛡️ ALL DOTA 2 ITEMS:\n\n';
      
      // Convert items object to array and sort by ID
      const itemsArray = Object.entries(this.itemsCache)
        .map(([key, item]) => ({ itemId: parseInt(key), itemName: item.dname, ...item }))
        .filter(item => !isNaN(item.itemId) && item.itemName) // Filter out invalid items
        .sort((a, b) => a.itemId - b.itemId);

      // Group items by type for better readability
      const consumables: any[] = [];
      const equipment: any[] = [];
      const other: any[] = [];

      itemsArray.forEach(item => {
        if (item.qual === 'consumable') {
          consumables.push(item);
        } else if (item.qual === 'component' || item.qual === 'artifact') {
          equipment.push(item);
        } else {
          other.push(item);
        }
      });

      result += '🍎 CONSUMABLES:\n';
      consumables.slice(0, 20).forEach(item => {
        result += `ID ${item.itemId}: ${item.itemName}\n`;
      });

      result += '\n⚔️ EQUIPMENT & ARTIFACTS:\n';
      equipment.slice(0, 50).forEach(item => {
        result += `ID ${item.itemId}: ${item.itemName}\n`;
      });

      if (other.length > 0) {
        result += '\n🔧 OTHER ITEMS:\n';
        other.slice(0, 30).forEach(item => {
          result += `ID ${item.itemId}: ${item.itemName}\n`;
        });
      }

      result += `\n📊 Total items loaded: ${itemsArray.length}`;

      // Show some common item IDs for reference
      result += '\n\n🎯 COMMON ITEM IDs FOR REFERENCE:\n';
      const commonItems = [
        { id: 1, expected: 'Blink Dagger' },
        { id: 36, expected: 'Boots of Speed' },
        { id: 50, expected: 'Power Treads' },
        { id: 63, expected: 'Phase Boots' },
        { id: 108, expected: 'Black King Bar' },
        { id: 123, expected: 'Manta Style' },
        { id: 135, expected: 'Battle Fury' },
        { id: 145, expected: 'Butterfly' },
        { id: 147, expected: 'Boots of Travel' },
        { id: 158, expected: 'Radiance' },
        { id: 208, expected: 'Mjollnir' }
      ];

      commonItems.forEach(item => {
        const actualItem = this.itemsCache![item.id.toString()];
        if (actualItem) {
          result += `ID ${item.id}: ${actualItem.dname}\n`;
        } else {
          result += `ID ${item.id}: ${item.expected} (expected)\n`;
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get items: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private getItemName(itemId: number): string {
    if (!this.itemsCache || itemId <= 0) {
      return itemId > 0 ? `Item ID ${itemId}` : 'Empty Slot';
    }
    
    const item = this.itemsCache[itemId.toString()];
    return item ? item.dname : `Item ID ${itemId}`;
  }

  private async ensureItemsCache() {
    if (!this.itemsCache) {
      this.itemsCache = await this.apiRequest('/constants/items');
    }
  }

  // Steam ID conversion utilities
  private steamId64ToAccountId(steamId64: string): number {
    // Steam ID 64 to Account ID conversion
    // Account ID = Steam ID 64 - 76561197960265728
    const steamId64BigInt = BigInt(steamId64);
    const baseOffset = BigInt('76561197960265728');
    return Number(steamId64BigInt - baseOffset);
  }

  private steamId32ToAccountId(steamId32: string): number {
    // Steam ID 32 format: STEAM_0:Y:Z where Account ID = Z * 2 + Y
    const match = steamId32.match(/^STEAM_[01]:([01]):(\d+)$/);
    if (!match) {
      throw new Error('Invalid Steam ID 32 format');
    }
    const Y = parseInt(match[1]);
    const Z = parseInt(match[2]);
    return Z * 2 + Y;
  }

  private parseAndConvertSteamId(steamId: string): number {
    // Remove any whitespace
    steamId = steamId.trim();
    
    // Check if it's already an account ID (8-10 digits)
    if (/^\d{8,10}$/.test(steamId)) {
      return parseInt(steamId);
    }
    
    // Check if it's Steam ID 64 (17 digits starting with 7656119)
    if (/^7656119\d{10}$/.test(steamId)) {
      return this.steamId64ToAccountId(steamId);
    }
    
    // Check if it's Steam ID 32 (STEAM_0:X:XXXXXX or STEAM_1:X:XXXXXX)
    if (/^STEAM_[01]:[01]:\d+$/.test(steamId)) {
      return this.steamId32ToAccountId(steamId);
    }
    
    // Check if it's a Steam profile URL
    const urlMatch = steamId.match(/(?:steamcommunity\.com\/(?:profiles\/(\d{17})|id\/([^\/]+)))/);
    if (urlMatch) {
      if (urlMatch[1]) {
        // Profile ID from URL
        return this.steamId64ToAccountId(urlMatch[1]);
      } else {
        // Custom URL - need to resolve this via Steam API (not supported in OpenDota directly)
        throw new Error('Custom Steam URLs need to be resolved separately. Please use Steam ID directly.');
      }
    }
    
    throw new Error(`Unrecognized Steam ID format: ${steamId}. Supported formats: Account ID, Steam ID 64, Steam ID 32 (STEAM_0:X:XXXXX), or Steam profile URL.`);
  }

  private async searchPlayer(steamName: string) {
    try {
      // Search for players by name
      const searchResults = await this.apiRequest(`/search?q=${encodeURIComponent(steamName)}`);
      
      if (!searchResults || searchResults.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No players found with the name "${steamName}". Please check the spelling or try a different name.`
            }
          ]
        };
      }

      // Get detailed info for the first match
      const player = searchResults[0] as PlayerProfile;
      const playerDetails = await this.apiRequest(`/players/${player.account_id}`);

      return {
        content: [
          {
            type: 'text',
            text: `Found player: ${player.personaname}
Account ID: ${player.account_id}
Steam ID: ${player.steamid}
Country: ${playerDetails.profile?.loccountrycode || 'Unknown'}
Plus Subscriber: ${playerDetails.profile?.plus ? 'Yes' : 'No'}
Last Login: ${playerDetails.profile?.last_login ? new Date(playerDetails.profile.last_login).toLocaleDateString() : 'Unknown'}

Profile URL: ${player.profileurl || 'Not available'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search for player: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async searchPlayerById(steamId: string) {
    try {
      // Convert Steam ID to Account ID
      let accountId: number;
      try {
        accountId = this.parseAndConvertSteamId(steamId);
      } catch (conversionError) {
        return {
          content: [
            {
              type: 'text',
              text: `Error parsing Steam ID: ${conversionError instanceof Error ? conversionError.message : String(conversionError)}`
            }
          ]
        };
      }

      // Get player details directly using account ID
      const playerDetails = await this.apiRequest(`/players/${accountId}`);
      
      if (!playerDetails || !playerDetails.profile) {
        return {
          content: [
            {
              type: 'text',
              text: `No player found with Steam ID "${steamId}" (Account ID: ${accountId}). The profile might be private or the ID might be incorrect.`
            }
          ]
        };
      }

      const profile = playerDetails.profile;
      
      // Format the response
      let result = `✅ Found player by Steam ID!\n`;
      result += `Player Name: ${profile.personaname || 'Unknown'}\n`;
      result += `Account ID: ${accountId}\n`;
      result += `Steam ID 64: ${profile.steamid || 'Unknown'}\n`;
      
      // Calculate Steam ID 32 from account ID
      const steamId32Y = accountId % 2;
      const steamId32Z = Math.floor(accountId / 2);
      result += `Steam ID 32: STEAM_0:${steamId32Y}:${steamId32Z}\n`;
      
      result += `Country: ${profile.loccountrycode || 'Unknown'}\n`;
      result += `Plus Subscriber: ${profile.plus ? 'Yes' : 'No'}\n`;
      result += `Cheese: ${profile.cheese || 0}\n`;
      
      if (profile.last_login) {
        result += `Last Login: ${new Date(profile.last_login).toLocaleDateString()}\n`;
      }
      
      if (profile.profileurl) {
        result += `Profile URL: ${profile.profileurl}\n`;
      }

      // Add rank information if available
      if (playerDetails.rank_tier) {
        const rankTier = playerDetails.rank_tier;
        const rankNames = {
          10: 'Herald', 20: 'Guardian', 30: 'Crusader', 40: 'Archon',
          50: 'Legend', 60: 'Ancient', 70: 'Divine', 80: 'Immortal'
        };
        const baseTier = Math.floor(rankTier / 10) * 10;
        const subTier = rankTier % 10;
        const rankName = rankNames[baseTier as keyof typeof rankNames] || 'Unknown';
        result += `Current Rank: ${rankName}${subTier > 0 ? ` [${subTier}]` : ''}\n`;
      }

      // Add MMR if available
      if (playerDetails.solo_competitive_rank) {
        result += `Solo MMR: ${playerDetails.solo_competitive_rank}\n`;
      }
      if (playerDetails.competitive_rank) {
        result += `Party MMR: ${playerDetails.competitive_rank}\n`;
      }

      result += `\n🎯 Use Account ID ${accountId} for further analysis with other commands.`;

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search for player by ID: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async getPlayerHeroes(accountId: number) {
    try {
      // Ensure we have hero data cached
      if (!this.heroesCache) {
        this.heroesCache = await this.apiRequest('/heroes');
      }

      const heroStats: HeroStats[] = await this.apiRequest(`/players/${accountId}/heroes`);
      
      if (!heroStats || heroStats.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No hero statistics found for this player.'
            }
          ]
        };
      }

      // Sort by games played (most played)
      const mostPlayed = [...heroStats]
        .sort((a, b) => b.games - a.games)
        .slice(0, 10);

      // Sort by win rate (most effective) - minimum 5 games
      const mostEffective = [...heroStats]
        .filter(hero => hero.games >= 5)
        .sort((a, b) => (b.win / b.games) - (a.win / a.games))
        .slice(0, 10);

      let result = '🎮 MOST PLAYED HEROES:\n';
      mostPlayed.forEach((hero, index) => {
        const winRate = ((hero.win / hero.games) * 100).toFixed(1);
        const heroName = this.getHeroName(parseInt(hero.hero_id));
        result += `${index + 1}. ${heroName}: ${hero.games} games (${winRate}% win rate)\n`;
      });

      result += '\n🏆 MOST EFFECTIVE HEROES (min 5 games):\n';
      mostEffective.forEach((hero, index) => {
        const winRate = ((hero.win / hero.games) * 100).toFixed(1);
        const heroName = this.getHeroName(parseInt(hero.hero_id));
        result += `${index + 1}. ${heroName}: ${winRate}% win rate (${hero.games} games)\n`;
      });

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get player heroes: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async getHeroAbilityBuilds(accountId: number, heroId: number) {
    try {
      // Ensure we have hero data cached
      if (!this.heroesCache) {
        this.heroesCache = await this.apiRequest('/heroes');
      }

      // Get recent matches for this hero
      const matches: MatchDetails[] = await this.apiRequest(
        `/players/${accountId}/matches?hero_id=${heroId}&limit=20`
      );

      if (!matches || matches.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No recent matches found for ${this.getHeroName(heroId)}`
            }
          ]
        };
      }

      // Get detailed match data for ability builds
      const detailedMatches: DetailedMatch[] = [];
      
      for (let i = 0; i < Math.min(matches.length, 10); i++) {
        try {
          const matchDetail = await this.apiRequest(`/matches/${matches[i].match_id}`);
          const playerData = matchDetail.players?.find((p: any) => 
            p.account_id === accountId
          );
          if (playerData && playerData.ability_upgrades_arr) {
            detailedMatches.push(playerData);
          }
        } catch (error) {
          console.warn(`Failed to fetch match ${matches[i].match_id}:`, error);
        }
      }

      if (detailedMatches.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No detailed ability build data available for ${this.getHeroName(heroId)}`
            }
          ]
        };
      }

      // Analyze ability builds by level
      const abilityByLevel: { [level: number]: { [ability: number]: number } } = {};

      detailedMatches.forEach(match => {
        if (match.ability_upgrades_arr) {
          match.ability_upgrades_arr.forEach(upgrade => {
            if (!abilityByLevel[upgrade.level]) {
              abilityByLevel[upgrade.level] = {};
            }
            if (!abilityByLevel[upgrade.level][upgrade.ability]) {
              abilityByLevel[upgrade.level][upgrade.ability] = 0;
            }
            abilityByLevel[upgrade.level][upgrade.ability]++;
          });
        }
      });

      let result = `📊 ABILITY BUILD ANALYSIS for ${this.getHeroName(heroId)}\n`;
      result += `Based on ${detailedMatches.length} recent matches:\n\n`;

      // Show most common ability choice for each level (1-25)
      for (let level = 1; level <= 25; level++) {
        if (abilityByLevel[level]) {
          const abilities = Object.entries(abilityByLevel[level]);
          const mostCommon = abilities.sort(([,a], [,b]) => b - a)[0];
          const percentage = ((mostCommon[1] / detailedMatches.length) * 100).toFixed(0);
          result += `Level ${level}: Ability ${mostCommon[0]} (${percentage}% of matches)\n`;
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get hero ability builds: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async getPlayerRecentMatches(accountId: number, limit: number = 20) {
    try {
      // Ensure we have hero data cached
      if (!this.heroesCache) {
        this.heroesCache = await this.apiRequest('/heroes');
      }

      const matches: MatchDetails[] = await this.apiRequest(
        `/players/${accountId}/matches?limit=${limit}`
      );

      if (!matches || matches.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No recent matches found for this player.'
            }
          ]
        };
      }

      let result = `📈 RECENT MATCHES (Last ${matches.length}):\n\n`;

      matches.forEach((match, index) => {
        const won = (match.player_slot < 128) === match.radiant_win;
        const duration = Math.floor(match.duration / 60);
        const kda = `${match.kills}/${match.deaths}/${match.assists}`;
        const date = new Date(match.start_time * 1000).toLocaleDateString();
        const heroName = this.getHeroName(match.hero_id);
        
        result += `${index + 1}. ${won ? '✅ WIN' : '❌ LOSS'} - ${heroName}\n`;
        result += `   KDA: ${kda} | Duration: ${duration}min | Date: ${date}\n\n`;
      });

      // Calculate some statistics
      const wins = matches.filter(m => (m.player_slot < 128) === m.radiant_win).length;
      const winRate = ((wins / matches.length) * 100).toFixed(1);
      
      result += `📊 SUMMARY:\n`;
      result += `Win Rate: ${winRate}% (${wins}/${matches.length})\n`;
      result += `Average KDA: ${(matches.reduce((sum, m) => sum + m.kills, 0) / matches.length).toFixed(1)}/`;
      result += `${(matches.reduce((sum, m) => sum + m.deaths, 0) / matches.length).toFixed(1)}/`;
      result += `${(matches.reduce((sum, m) => sum + m.assists, 0) / matches.length).toFixed(1)}`;

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get recent matches: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async getHeroMatchups(heroId: number) {
    try {
      // Ensure we have hero data cached
      if (!this.heroesCache) {
        this.heroesCache = await this.apiRequest('/heroes');
      }

      const matchups: HeroMatchup[] = await this.apiRequest(`/heroes/${heroId}/matchups`);
      
      if (!matchups || matchups.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No matchup data found for ${this.getHeroName(heroId)}`
            }
          ]
        };
      }

      // Calculate win rates and sort
      const matchupsWithWinRate = matchups.map(matchup => ({
        ...matchup,
        winRate: (matchup.wins / matchup.games_played) * 100
      }));

      // Best matchups (highest win rate, minimum 50 games)
      const bestMatchups = matchupsWithWinRate
        .filter(m => m.games_played >= 50)
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 10);

      // Worst matchups (lowest win rate, minimum 50 games)
      const worstMatchups = matchupsWithWinRate
        .filter(m => m.games_played >= 50)
        .sort((a, b) => a.winRate - b.winRate)
        .slice(0, 10);

      let result = `⚔️ MATCHUP ANALYSIS for ${this.getHeroName(heroId)}\n\n`;
      
      result += `🟢 BEST MATCHUPS (Heroes to pick ${this.getHeroName(heroId)} against):\n`;
      bestMatchups.forEach((matchup, index) => {
        const enemyName = this.getHeroName(matchup.hero_id);
        result += `${index + 1}. vs ${enemyName}: ${matchup.winRate.toFixed(1)}% win rate (${matchup.games_played} games)\n`;
      });

      result += `\n🔴 WORST MATCHUPS (Heroes that counter ${this.getHeroName(heroId)}):\n`;
      worstMatchups.forEach((matchup, index) => {
        const enemyName = this.getHeroName(matchup.hero_id);
        result += `${index + 1}. vs ${enemyName}: ${matchup.winRate.toFixed(1)}% win rate (${matchup.games_played} games)\n`;
      });

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get hero matchups: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async getItemBuilds(accountId: number, heroId: number) {
    try {
      // Ensure we have hero and item data cached
      if (!this.heroesCache) {
        this.heroesCache = await this.apiRequest('/heroes');
      }
      await this.ensureItemsCache();

      // Get recent matches for this hero to analyze item builds
      const matches: MatchDetails[] = await this.apiRequest(
        `/players/${accountId}/matches?hero_id=${heroId}&limit=20`
      );

      if (!matches || matches.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No recent matches found for ${this.getHeroName(heroId)}`
            }
          ]
        };
      }

      // Get detailed match data for item builds
      const detailedMatches: DetailedMatch[] = [];
      
      for (let i = 0; i < Math.min(matches.length, 10); i++) {
        try {
          const matchDetail = await this.apiRequest(`/matches/${matches[i].match_id}`);
          const playerData = matchDetail.players?.find((p: any) => 
            p.account_id === accountId
          );
          if (playerData) {
            detailedMatches.push(playerData);
          }
        } catch (error) {
          console.warn(`Failed to fetch match ${matches[i].match_id}:`, error);
        }
      }

      if (detailedMatches.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No detailed item build data available for ${this.getHeroName(heroId)}`
            }
          ]
        };
      }

      // Analyze item frequency and win rates
      const itemStats: { [itemId: number]: { games: number; wins: number } } = {};

      detailedMatches.forEach(match => {
        const won = match.radiant_win === (match.player_slot < 128);
        
        // Analyze final items (slots 0-5)
        [match.item_0, match.item_1, match.item_2, match.item_3, match.item_4, match.item_5]
          .filter(item => item && item > 0)
          .forEach(itemId => {
            if (!itemStats[itemId!]) {
              itemStats[itemId!] = { games: 0, wins: 0 };
            }
            itemStats[itemId!].games++;
            if (won) {
              itemStats[itemId!].wins++;
            }
          });
      });

      // Sort items by frequency (most built)
      const sortedItems = Object.entries(itemStats)
        .map(([itemId, stats]) => ({
          itemId: parseInt(itemId),
          itemName: this.getItemName(parseInt(itemId)),
          ...stats,
          winRate: (stats.wins / stats.games) * 100
        }))
        .filter(item => item.games >= 2) // Minimum 2 games
        .sort((a, b) => b.games - a.games);

      let result = `🛡️ ITEM BUILD ANALYSIS for ${this.getHeroName(heroId)}\n`;
      result += `Based on ${detailedMatches.length} recent matches by this player:\n\n`;

      result += `📦 MOST FREQUENTLY BUILT ITEMS:\n`;
      sortedItems.slice(0, 15).forEach((item, index) => {
        const frequency = ((item.games / detailedMatches.length) * 100).toFixed(0);
        result += `${index + 1}. ${item.itemName}: Built in ${frequency}% of games (${item.winRate.toFixed(1)}% win rate)\n`;
      });

      // Show highest win rate items (minimum 3 games)
      const highWinRateItems = sortedItems
        .filter(item => item.games >= 3)
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 10);

      if (highWinRateItems.length > 0) {
        result += `\n🏆 HIGHEST WIN RATE ITEMS (min 3 games):\n`;
        highWinRateItems.forEach((item, index) => {
          result += `${index + 1}. ${item.itemName}: ${item.winRate.toFixed(1)}% win rate (${item.games} games)\n`;
        });
      }

      // Analyze build patterns with better item name detection
      result += `\n🎯 BUILD PATTERN ANALYSIS:\n`;
      
      // Look for core items (high frequency + high win rate)
      const coreItems = sortedItems.filter(item => 
        item.games >= Math.ceil(detailedMatches.length * 0.5) && item.winRate >= 50
      );
      
      if (coreItems.length > 0) {
        result += `Core Items (built >50% of games): ${coreItems.map(item => item.itemName).join(', ')}\n`;
      }

      // Identify farming vs fighting builds with specific item names
      const farmingItemNames = ['Battle Fury', 'Radiance', 'Maelstrom', 'Mjollnir', 'Hand of Midas', 'Battlefury'];
      const fightingItemNames = ['Black King Bar', 'Blade Mail', 'Drum of Endurance', 'Phase Boots', 'Magic Wand', 'Diffusal Blade'];
      
      const farmingItems = sortedItems.filter(item => 
        farmingItemNames.some(name => item.itemName.toLowerCase().includes(name.toLowerCase()))
      );
      
      const fightingItems = sortedItems.filter(item => 
        fightingItemNames.some(name => item.itemName.toLowerCase().includes(name.toLowerCase()))
      );

      if (farmingItems.length > 0) {
        result += `Farming Items: ${farmingItems.map(item => `${item.itemName} (${item.games} games)`).join(', ')}\n`;
      }
      
      if (fightingItems.length > 0) {
        result += `Fighting Items: ${fightingItems.map(item => `${item.itemName} (${item.games} games)`).join(', ')}\n`;
      }

      // Overall build tendency
      const farmingGames = farmingItems.reduce((sum, item) => sum + item.games, 0);
      const fightingGames = fightingItems.reduce((sum, item) => sum + item.games, 0);
      
      if (farmingGames > fightingGames && farmingGames > 0) {
        result += `\n💡 PLAYSTYLE: Tends to favor farming/scaling builds (${farmingGames} farming vs ${fightingGames} fighting item instances)\n`;
      } else if (fightingGames > farmingGames && fightingGames > 0) {
        result += `\n💡 PLAYSTYLE: Tends to favor fighting/tempo builds (${fightingGames} fighting vs ${farmingGames} farming item instances)\n`;
      } else {
        result += `\n💡 PLAYSTYLE: Balanced approach or insufficient data to determine clear preference\n`;
      }

      // Add item ID reference for debugging
      result += `\n🔧 ITEM ID REFERENCE (for manual lookup):\n`;
      sortedItems.slice(0, 8).forEach(item => {
        result += `${item.itemName} = ID ${item.itemId}\n`;
      });

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get item builds: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async suggestDraftPicks(allyHeroes: number[], enemyHeroes: number[], playerAccountId?: number | null) {
    try {
      // Ensure we have hero data cached
      if (!this.heroesCache) {
        this.heroesCache = await this.apiRequest('/heroes');
      }

      if (!this.heroStatsCache) {
        this.heroStatsCache = await this.apiRequest('/heroStats');
      }

      if (!this.heroesCache || !this.heroStatsCache) {
        return {
          content: [
            {
              type: 'text',
              text: 'Failed to load hero data for draft analysis.'
            }
          ]
        };
      }

      const allPicked = [...allyHeroes, ...enemyHeroes];
      const availableHeroes = this.heroesCache.filter(hero => !allPicked.includes(hero.id));

      // Get player's hero pool if account ID provided
      let playerHeroes: HeroStats[] = [];
      if (playerAccountId) {
        try {
          const playerHeroStats = await this.apiRequest(`/players/${playerAccountId}/heroes`);
          playerHeroes = playerHeroStats.filter((h: any) => h.games >= 3); // Minimum 3 games
        } catch (error) {
          console.warn('Could not fetch player hero data:', error);
        }
      }

      // Analyze team composition needs
      const allyRoles = this.analyzeTeamRoles(allyHeroes);
      const enemyRoles = this.analyzeTeamRoles(enemyHeroes);

      // Score each available hero
      const heroScores = availableHeroes.map(hero => {
        let score = 0;
        const heroStat = this.heroStatsCache!.find(h => h.id === hero.id);
        
        if (!heroStat) return { hero, score: 0, reasons: [] };

        const reasons: string[] = [];

        // Meta strength (current patch win rate)
        const metaWinRate = heroStat['7_win'] || 0; // Assuming bracket 7 is high skill
        if (metaWinRate > 52) {
          score += 20;
          reasons.push(`Strong in meta (${metaWinRate.toFixed(1)}% win rate)`);
        }

        // Role synergy - check if hero fills missing role
        const missingRoles = ['Carry', 'Support', 'Initiator', 'Durable', 'Nuker']
          .filter(role => !allyRoles.includes(role));
        
        const heroRoles = hero.roles || [];
        const fillsNeededRole = heroRoles.some(role => missingRoles.includes(role));
        if (fillsNeededRole) {
          score += 25;
          reasons.push(`Fills needed role: ${heroRoles.find(r => missingRoles.includes(r))}`);
        }

        // Counter potential - good against enemy team
        // This is simplified - in reality you'd check specific matchup data
        if (enemyHeroes.length > 0) {
          score += 10;
          reasons.push('Has counter potential vs enemy picks');
        }

        // Player familiarity bonus
        if (playerAccountId && playerHeroes.length > 0) {
          const playerHero = playerHeroes.find(ph => parseInt(ph.hero_id) === hero.id);
          if (playerHero) {
            const playerWinRate = (playerHero.win / playerHero.games) * 100;
            if (playerWinRate > 55) {
              score += 30;
              reasons.push(`Player has ${playerWinRate.toFixed(1)}% win rate (${playerHero.games} games)`);
            } else if (playerHero.games >= 10) {
              score += 15;
              reasons.push(`Player experienced (${playerHero.games} games)`);
            }
          }
        }

        // Pick rate bonus (popular = proven)
        const pickRate = heroStat['7_pick'] || 0;
        if (pickRate > 15) {
          score += 10;
          reasons.push('Popular pick in high MMR');
        }

        return { hero, score, reasons };
      });

      // Sort by score and get top suggestions
      const topSuggestions = heroScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      let result = `🎯 DRAFT PICK SUGGESTIONS\n\n`;
      
      result += `📊 Current Draft State:\n`;
      result += `Ally Team: ${allyHeroes.map(id => this.getHeroName(id)).join(', ') || 'None'}\n`;
      result += `Enemy Team: ${enemyHeroes.map(id => this.getHeroName(id)).join(', ') || 'None'}\n`;
      result += `Team Roles: ${allyRoles.join(', ') || 'None identified'}\n\n`;

      result += `🔝 TOP RECOMMENDATIONS:\n`;
      topSuggestions.forEach((suggestion, index) => {
        result += `${index + 1}. ${suggestion.hero.localized_name} (Score: ${suggestion.score})\n`;
        if (suggestion.reasons.length > 0) {
          result += `   Reasons: ${suggestion.reasons.join(', ')}\n`;
        }
        result += `   Roles: ${(suggestion.hero.roles || []).join(', ')}\n\n`;
      });

      if (playerAccountId && playerHeroes.length === 0) {
        result += `💡 Note: No player history found. Suggestions based on meta and team composition only.\n`;
      }

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to suggest draft picks: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private analyzeTeamRoles(heroIds: number[]): string[] {
    if (!this.heroesCache) return [];
    
    const roles = new Set<string>();
    heroIds.forEach(heroId => {
      const hero = this.heroesCache!.find(h => h.id === heroId);
      if (hero && hero.roles) {
        hero.roles.forEach(role => roles.add(role));
      }
    });
    
    return Array.from(roles);
  }

  private async getMetaAnalysis(rankBracket: string = 'all', focus: string = 'overview') {
    try {
      // Ensure we have hero data cached
      if (!this.heroesCache) {
        this.heroesCache = await this.apiRequest('/heroes');
      }
      if (!this.heroStatsCache) {
        this.heroStatsCache = await this.apiRequest('/heroStats');
      }

      if (!this.heroesCache || !this.heroStatsCache) {
        return {
          content: [
            {
              type: 'text',
              text: 'Failed to load hero data for meta analysis.'
            }
          ]
        };
      }

      // Map bracket names to API numbers
      const bracketMap: { [key: string]: string } = {
        'herald': '1',
        'guardian': '2', 
        'crusader': '3',
        'archon': '4',
        'legend': '5',
        'ancient': '6',
        'divine': '7',
        'immortal': '8',
        'pro': 'pro',
        'all': '7' // Default to Divine bracket for "all"
      };

      const bracket = bracketMap[rankBracket.toLowerCase()] || '7';
      
      // Combine hero data with stats
      const heroMetaData = this.heroesCache.map(hero => {
        const stats = this.heroStatsCache!.find(s => s.id === hero.id);
        if (!stats) return null;

        const pickKey = bracket === 'pro' ? 'pro_pick' : `${bracket}_pick` as keyof HeroStats;
        const winKey = bracket === 'pro' ? 'pro_win' : `${bracket}_win` as keyof HeroStats;
        const banKey = 'pro_ban'; // Only pro has ban data

        return {
          ...hero,
          pickRate: (stats[pickKey] as number) || 0,
          winRate: (stats[winKey] as number) || 0,
          banRate: bracket === 'pro' ? ((stats[banKey] as number) || 0) : 0,
          netScore: ((stats[winKey] as number) || 0) * ((stats[pickKey] as number) || 0) / 100
        };
      }).filter((hero): hero is NonNullable<typeof hero> => hero !== null && hero.pickRate > 0);

      let result = `📈 DOTA 2 META ANALYSIS\n`;
      result += `Rank Bracket: ${rankBracket.toUpperCase()} | Focus: ${focus.toUpperCase()}\n\n`;

      if (focus === 'trending' || focus === 'overview') {
        // Most picked heroes
        const mostPicked = [...heroMetaData]
          .sort((a, b) => b.pickRate - a.pickRate)
          .slice(0, 15);

        result += `🔥 MOST PICKED HEROES:\n`;
        mostPicked.forEach((hero, index) => {
          result += `${index + 1}. ${hero.localized_name}: ${hero.pickRate.toFixed(1)}% pick rate (${hero.winRate.toFixed(1)}% win rate)\n`;
        });
        result += '\n';
      }

      if (focus === 'winrates' || focus === 'overview') {
        // Highest win rate heroes (minimum pick rate threshold)
        const minPickRate = rankBracket === 'pro' ? 5 : 3;
        const highestWinRate = [...heroMetaData]
          .filter(hero => hero.pickRate >= minPickRate)
          .sort((a, b) => b.winRate - a.winRate)
          .slice(0, 15);

        result += `🏆 HIGHEST WIN RATE HEROES (min ${minPickRate}% pick rate):\n`;
        highestWinRate.forEach((hero, index) => {
          result += `${index + 1}. ${hero.localized_name}: ${hero.winRate.toFixed(1)}% win rate (${hero.pickRate.toFixed(1)}% pick rate)\n`;
        });
        result += '\n';
      }

      let mostBanned: typeof heroMetaData = [];
      if (bracket === 'pro' && (focus === 'overview' || focus === 'pickrates')) {
        // Most banned heroes (pro only)
        mostBanned = [...heroMetaData]
          .filter(hero => hero.banRate > 0)
          .sort((a, b) => b.banRate - a.banRate)
          .slice(0, 10);

        result += `🚫 MOST BANNED HEROES (Pro Scene):\n`;
        mostBanned.forEach((hero, index) => {
          result += `${index + 1}. ${hero.localized_name}: ${hero.banRate.toFixed(1)}% ban rate\n`;
        });
        result += '\n';
      }

      // Meta strength analysis
      const strongHeroes = [...heroMetaData]
        .filter(hero => hero.winRate >= 52 && hero.pickRate >= 5)
        .sort((a, b) => b.netScore - a.netScore)
        .slice(0, 10);

      result += `⚡ META POWERHOUSES (High Pick + Win Rate):\n`;
      strongHeroes.forEach((hero, index) => {
        result += `${index + 1}. ${hero.localized_name}: ${hero.winRate.toFixed(1)}% WR, ${hero.pickRate.toFixed(1)}% PR\n`;
      });

      // Role analysis
      result += `\n🎭 ROLE BREAKDOWN:\n`;
      const roleStats: { [role: string]: { heroes: number; avgWinRate: number; avgPickRate: number } } = {};
      
      heroMetaData.forEach(hero => {
        hero.roles.forEach(role => {
          if (!roleStats[role]) {
            roleStats[role] = { heroes: 0, avgWinRate: 0, avgPickRate: 0 };
          }
          roleStats[role].heroes++;
          roleStats[role].avgWinRate += hero.winRate;
          roleStats[role].avgPickRate += hero.pickRate;
        });
      });

      Object.entries(roleStats).forEach(([role, stats]) => {
        const avgWR = (stats.avgWinRate / stats.heroes).toFixed(1);
        const avgPR = (stats.avgPickRate / stats.heroes).toFixed(1);
        result += `${role}: ${avgWR}% avg WR, ${avgPR}% avg PR (${stats.heroes} heroes)\n`;
      });

      // Meta insights
      result += `\n💡 META INSIGHTS:\n`;
      
      const totalHeroes = heroMetaData.length;
      const balancedHeroes = heroMetaData.filter(h => h.winRate >= 48 && h.winRate <= 52).length;
      const balanceScore = (balancedHeroes / totalHeroes * 100).toFixed(1);
      
      result += `• Meta Balance: ${balanceScore}% of heroes have 48-52% win rate\n`;
      
      const dominantHeroes = heroMetaData.filter(h => h.winRate > 55 && h.pickRate > 10).length;
      if (dominantHeroes > 0) {
        result += `• ${dominantHeroes} heroes are currently dominant (>55% WR, >10% PR)\n`;
      }
      
      const avgPickRate = (heroMetaData.reduce((sum, h) => sum + h.pickRate, 0) / totalHeroes).toFixed(1);
      result += `• Average pick rate: ${avgPickRate}%\n`;

      if (focus === 'overview') {
        result += `\n📋 QUICK RECOMMENDATIONS:\n`;
        result += `• Strong Picks: ${strongHeroes.slice(0, 3).map(h => h.localized_name).join(', ')}\n`;
        
        const weakHeroes = heroMetaData.filter(h => h.winRate < 45 && h.pickRate > 5).slice(0, 3);
        result += `• Avoid: ${weakHeroes.map(h => h.localized_name).join(', ') || 'None identified'}\n`;
        
        if (bracket === 'pro' && mostBanned.length > 0) {
          const mustBans = mostBanned.slice(0, 3).map(h => h.localized_name).join(', ');
          result += `• Priority Bans: ${mustBans}\n`;
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get meta analysis: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async analyzePerformancePatterns(accountId: number, matchLimit: number = 50, analysisDepth: string = 'detailed') {
    try {
      // Ensure we have hero data cached
      if (!this.heroesCache) {
        this.heroesCache = await this.apiRequest('/heroes');
      }

      // Get player's recent matches
      const matches: PlayerMatch[] = await this.apiRequest(`/players/${accountId}/matches?limit=${matchLimit}`);
      
      if (!matches || matches.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No recent matches found for performance analysis.'
            }
          ]
        };
      }

      const patterns: PerformancePattern[] = [];
      let result = `🔍 PERFORMANCE PATTERN ANALYSIS\n`;
      result += `Player Account ID: ${accountId}\n`;
      result += `Matches Analyzed: ${matches.length}\n`;
      result += `Analysis Depth: ${analysisDepth.toUpperCase()}\n\n`;

      // Basic win rate analysis
      const wins = matches.filter(m => (m.player_slot < 128) === m.radiant_win).length;
      const winRate = (wins / matches.length * 100).toFixed(1);
      result += `📊 OVERALL PERFORMANCE:\n`;
      result += `Current Win Rate: ${winRate}% (${wins}/${matches.length})\n\n`;

      // Game duration patterns
      const shortGames = matches.filter(m => m.duration < 1800); // <30min
      const mediumGames = matches.filter(m => m.duration >= 1800 && m.duration < 2400); // 30-40min
      const longGames = matches.filter(m => m.duration >= 2400); // >40min

      const shortWins = shortGames.filter(m => (m.player_slot < 128) === m.radiant_win).length;
      const mediumWins = mediumGames.filter(m => (m.player_slot < 128) === m.radiant_win).length;
      const longWins = longGames.filter(m => (m.player_slot < 128) === m.radiant_win).length;

      result += `⏱️ GAME DURATION PATTERNS:\n`;
      
      if (shortGames.length > 0) {
        const shortWR = (shortWins / shortGames.length * 100).toFixed(1);
        result += `Short Games (<30min): ${shortWR}% win rate (${shortWins}/${shortGames.length})\n`;
        
        if (parseFloat(shortWR) > parseFloat(winRate) + 5) {
          patterns.push({
            category: 'Timing',
            pattern: 'Strong in short games',
            confidence: 0.8,
            sample_size: shortGames.length,
            recommendation: 'Focus on early game aggression and tempo'
          });
        } else if (parseFloat(shortWR) < parseFloat(winRate) - 5) {
          patterns.push({
            category: 'Timing',
            pattern: 'Weak in short games',
            confidence: 0.8,
            sample_size: shortGames.length,
            recommendation: 'Work on laning phase and early game execution'
          });
        }
      }

      if (mediumGames.length > 0) {
        const mediumWR = (mediumWins / mediumGames.length * 100).toFixed(1);
        result += `Medium Games (30-40min): ${mediumWR}% win rate (${mediumWins}/${mediumGames.length})\n`;
      }

      if (longGames.length > 0) {
        const longWR = (longWins / longGames.length * 100).toFixed(1);
        result += `Long Games (>40min): ${longWR}% win rate (${longWins}/${longGames.length})\n`;
        
        if (parseFloat(longWR) > parseFloat(winRate) + 5) {
          patterns.push({
            category: 'Timing',
            pattern: 'Strong in late game',
            confidence: 0.8,
            sample_size: longGames.length,
            recommendation: 'Good at scaling - consider late game heroes'
          });
        } else if (parseFloat(longWR) < parseFloat(winRate) - 5) {
          patterns.push({
            category: 'Timing',
            pattern: 'Struggles in late game',
            confidence: 0.8,
            sample_size: longGames.length,
            recommendation: 'Focus on closing games earlier or late game decision making'
          });
        }
      }

      // KDA patterns
      const avgKills = matches.reduce((sum, m) => sum + m.kills, 0) / matches.length;
      const avgDeaths = matches.reduce((sum, m) => sum + m.deaths, 0) / matches.length;
      const avgAssists = matches.reduce((sum, m) => sum + m.assists, 0) / matches.length;
      const kdaRatio = (avgKills + avgAssists) / Math.max(avgDeaths, 1);

      result += `\n💀 COMBAT PATTERNS:\n`;
      result += `Average KDA: ${avgKills.toFixed(1)}/${avgDeaths.toFixed(1)}/${avgAssists.toFixed(1)} (${kdaRatio.toFixed(2)} ratio)\n`;

      if (avgDeaths > 8) {
        patterns.push({
          category: 'Combat',
          pattern: 'High death count',
          confidence: 0.9,
          sample_size: matches.length,
          recommendation: 'Focus on positioning and map awareness'
        });
      }

      if (avgAssists > avgKills * 1.5) {
        patterns.push({
          category: 'Combat',
          pattern: 'Team fight oriented',
          confidence: 0.8,
          sample_size: matches.length,
          recommendation: 'Good team fighter - consider playmaking heroes'
        });
      }

      // Role performance analysis
      const rolePerformance: { [role: string]: { games: number; wins: number; } } = {};
      
      matches.forEach(match => {
        const hero = this.heroesCache!.find(h => h.id === match.hero_id);
        if (hero && hero.roles) {
          hero.roles.forEach(role => {
            if (!rolePerformance[role]) {
              rolePerformance[role] = { games: 0, wins: 0 };
            }
            rolePerformance[role].games++;
            if ((match.player_slot < 128) === match.radiant_win) {
              rolePerformance[role].wins++;
            }
          });
        }
      });

      result += `\n🎭 ROLE PERFORMANCE:\n`;
      Object.entries(rolePerformance)
        .filter(([role, stats]) => stats.games >= 3)
        .sort(([,a], [,b]) => (b.wins/b.games) - (a.wins/a.games))
        .forEach(([role, stats]) => {
          const roleWR = (stats.wins / stats.games * 100).toFixed(1);
          result += `${role}: ${roleWR}% win rate (${stats.wins}/${stats.games} games)\n`;
          
          if (parseFloat(roleWR) > parseFloat(winRate) + 10 && stats.games >= 5) {
            patterns.push({
              category: 'Role',
              pattern: `Excels at ${role} role`,
              confidence: 0.9,
              sample_size: stats.games,
              recommendation: `Consider more ${role} heroes`
            });
          } else if (parseFloat(roleWR) < parseFloat(winRate) - 10 && stats.games >= 5) {
            patterns.push({
              category: 'Role',
              pattern: `Struggles with ${role} role`,
              confidence: 0.8,
              sample_size: stats.games,
              recommendation: `Practice ${role} fundamentals or avoid this role`
            });
          }
        });

      if (analysisDepth === 'detailed' || analysisDepth === 'comprehensive') {
        // Recent performance trends
        const recentMatches = matches.slice(0, 10);
        const recentWins = recentMatches.filter(m => (m.player_slot < 128) === m.radiant_win).length;
        const recentWR = (recentWins / recentMatches.length * 100).toFixed(1);

        result += `\n📈 RECENT FORM (Last 10 games):\n`;
        result += `Recent Win Rate: ${recentWR}% (${recentWins}/${recentMatches.length})\n`;

        if (parseFloat(recentWR) > parseFloat(winRate) + 10) {
          patterns.push({
            category: 'Form',
            pattern: 'Currently on good form',
            confidence: 0.7,
            sample_size: recentMatches.length,
            recommendation: 'Player is improving - good time to face them'
          });
        } else if (parseFloat(recentWR) < parseFloat(winRate) - 10) {
          patterns.push({
            category: 'Form',
            pattern: 'Currently struggling',
            confidence: 0.7,
            sample_size: recentMatches.length,
            recommendation: 'Player may be in a slump - exploit with pressure'
          });
        }

        // Performance vs different skill levels
        const rankedMatches = matches.filter(m => m.lobby_type === 7); // Ranked matches
        if (rankedMatches.length > 0) {
          const rankedWins = rankedMatches.filter(m => (m.player_slot < 128) === m.radiant_win).length;
          const rankedWR = (rankedWins / rankedMatches.length * 100).toFixed(1);
          result += `Ranked Performance: ${rankedWR}% (${rankedWins}/${rankedMatches.length})\n`;
        }
      }

      if (analysisDepth === 'comprehensive') {
        // Party vs solo performance
        const soloMatches = matches.filter(m => m.party_size === 1);
        const partyMatches = matches.filter(m => m.party_size > 1);

        if (soloMatches.length > 0 && partyMatches.length > 0) {
          const soloWins = soloMatches.filter(m => (m.player_slot < 128) === m.radiant_win).length;
          const partyWins = partyMatches.filter(m => (m.player_slot < 128) === m.radiant_win).length;
          
          const soloWR = (soloWins / soloMatches.length * 100).toFixed(1);
          const partyWR = (partyWins / partyMatches.length * 100).toFixed(1);

          result += `\n👥 PARTY vs SOLO:\n`;
          result += `Solo Queue: ${soloWR}% (${soloWins}/${soloMatches.length})\n`;
          result += `Party Queue: ${partyWR}% (${partyWins}/${partyMatches.length})\n`;

          if (parseFloat(partyWR) > parseFloat(soloWR) + 10) {
            patterns.push({
              category: 'Context',
              pattern: 'Much stronger in party',
              confidence: 0.8,
              sample_size: Math.min(soloMatches.length, partyMatches.length),
              recommendation: 'Team coordination dependent - pressure individual play'
            });
          }
        }
      }

      // Pattern summary
      result += `\n🎯 IDENTIFIED PATTERNS:\n`;
      if (patterns.length === 0) {
        result += `No significant patterns detected. Player shows consistent performance across different contexts.\n`;
      } else {
        patterns.forEach((pattern, index) => {
          result += `${index + 1}. ${pattern.category}: ${pattern.pattern}\n`;
          result += `   Confidence: ${(pattern.confidence * 100).toFixed(0)}% | Sample: ${pattern.sample_size} games\n`;
          result += `   💡 ${pattern.recommendation}\n\n`;
        });
      }

      // Strategic recommendations
      result += `🏆 STRATEGIC RECOMMENDATIONS:\n`;
      const topPatterns = patterns.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
      
      if (topPatterns.length > 0) {
        result += `• Primary Weakness: ${topPatterns[0].pattern}\n`;
        result += `• Exploitation Strategy: ${topPatterns[0].recommendation}\n`;
        
        if (topPatterns.length > 1) {
          result += `• Secondary Pattern: ${topPatterns[1].pattern}\n`;
        }
      } else {
        result += `• Well-rounded player with no obvious exploitable weaknesses\n`;
        result += `• Focus on standard counter-picking and team coordination\n`;
      }

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to analyze performance patterns: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Dota 2 MCP server running on stdio');
  }
}

const server = new Dota2MCPServer();
server.run().catch(console.error);