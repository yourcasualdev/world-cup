import dotenv from 'dotenv';
import prisma from '../db';

dotenv.config();

const FOOTBALL_DATA_URL = 'https://api.football-data.org/v4';
const token = process.env.FOOTBALL_DATA_API_KEY;

if (!token) {
  throw new Error('FOOTBALL_DATA_API_KEY is not defined in .env');
}

const headers = { 'X-Auth-Token': token };

/**
 * Fetches World Cup teams from football-data.org and upserts them into DB
 */
export async function syncTeams() {
  console.log('🔄 SnycTeams: Takımlar çekiliyor...');
  const res = await fetch(`${FOOTBALL_DATA_URL}/competitions/WC/teams`, { headers });
  
  if (!res.ok) throw new Error(`Failed to fetch teams: ${res.statusText}`);
  
  const data = await res.json();
  const teams = data.teams || [];

  for (const team of teams) {
    await prisma.team.upsert({
      where: { extApiId: team.id },
      update: {
        name: team.name,
        flagUrl: team.crest,
      },
      create: {
        extApiId: team.id,
        name: team.name,
        flagUrl: team.crest,
      }
    });
  }
  console.log(`✅ SnycTeams: ${teams.length} takım veritabanına işlendi.`);
}

/**
 * Fetches World Cup matches (fixtures) from football-data.org and upserts into DB
 */
export async function syncMatches() {
  console.log('🔄 SyncMatches: Maçlar çekiliyor...');
  const res = await fetch(`${FOOTBALL_DATA_URL}/competitions/WC/matches`, { headers });
  
  if (!res.ok) throw new Error(`Failed to fetch matches: ${res.statusText}`);

  const data = await res.json();
  const matches = data.matches || [];

  for (const match of matches) {
    // Ensure teams exist (in case of placeholders, team might be null)
    let homeTeamId = null;
    if (match.homeTeam?.id) {
      const dbHome = await prisma.team.findUnique({ where: { extApiId: match.homeTeam.id } });
      if (dbHome) homeTeamId = dbHome.id;
    }

    let awayTeamId = null;
    if (match.awayTeam?.id) {
      const dbAway = await prisma.team.findUnique({ where: { extApiId: match.awayTeam.id } });
      if (dbAway) awayTeamId = dbAway.id;
    }

    // Skip if we don't have both teams determined yet (e.g., TBD vs TBD)
    if (!homeTeamId || !awayTeamId) {
       continue;
    }

    await prisma.match.upsert({
      where: { extApiId: match.id },
      update: {
        status: match.status,
        matchDate: new Date(match.utcDate),
        homeScore: match.score?.fullTime?.home ?? null,
        awayScore: match.score?.fullTime?.away ?? null,
        stage: match.stage,
        matchday: match.matchday,
      },
      create: {
        extApiId: match.id,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        status: match.status,
        matchDate: new Date(match.utcDate),
        homeScore: match.score?.fullTime?.home ?? null,
        awayScore: match.score?.fullTime?.away ?? null,
        stage: match.stage,
        matchday: match.matchday,
      }
    });
  }
  console.log(`✅ SyncMatches: Fiksür veritabanına işlendi.`);
}

/**
 * Fetches Standings (Groups) from football-data.org and upserts into DB
 */
export async function syncStandings() {
  console.log('🔄 SyncStandings: Puan durumları çekiliyor...');
  const res = await fetch(`${FOOTBALL_DATA_URL}/competitions/WC/standings`, { headers });
  
  if (!res.ok) throw new Error(`Failed to fetch standings: ${res.statusText}`);

  const data = await res.json();
  const standingsData = data.standings || [];

  for (const groupData of standingsData) {
    // Only process actual groups, ignore form/home/away tables if provided
    if (groupData.type !== 'TOTAL') continue;
    
    // Upsert Group
    const groupName = groupData.group;
    const group = await prisma.group.upsert({
      where: { name: groupName },
      update: {},
      create: { name: groupName }
    });

    for (const row of groupData.table) {
      const dbTeam = await prisma.team.findUnique({ where: { extApiId: row.team.id } });
      if (!dbTeam) continue;

      // Update Team to reference the Group
      await prisma.team.update({
        where: { id: dbTeam.id },
        data: { groupId: group.id }
      });

      // Upsert Standing
      // Because we used @@unique([groupId, teamId])
      const existingStanding = await prisma.standing.findUnique({
        where: {
          groupId_teamId: {
            groupId: group.id,
            teamId: dbTeam.id
          }
        }
      });

      if (existingStanding) {
        await prisma.standing.update({
          where: { id: existingStanding.id },
          data: {
            playedGames: row.playedGames,
            won: row.won,
            draw: row.draw,
            lost: row.lost,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            points: row.points,
            position: row.position
          }
        });
      } else {
        await prisma.standing.create({
          data: {
            groupId: group.id,
            teamId: dbTeam.id,
            playedGames: row.playedGames,
            won: row.won,
            draw: row.draw,
            lost: row.lost,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            points: row.points,
            position: row.position
          }
        });
      }
    }
  }
  console.log(`✅ SyncStandings: Gruplar ve puan durumları veritabanına işlendi.`);
}
