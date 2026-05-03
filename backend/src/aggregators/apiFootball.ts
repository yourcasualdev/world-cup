import dotenv from 'dotenv';
import prisma from '../db';

dotenv.config();

const API_SPORTS_URL = 'https://v3.football.api-sports.io';
const key = process.env.API_FOOTBALL_KEY;

if (!key) {
  throw new Error('API_FOOTBALL_KEY is not defined in .env');
}

const headers = { 'x-apisports-key': key };

/**
 * Fetches squads from api-football and upserts them into DB
 * Note: Using 2022 season for WC as 2026 squads might not be available yet.
 */
export async function syncSquads() {
  console.log('🔄 SnycSquads: Kadrolar çekiliyor...');
  
  // 1. Önce api-football tarafındaki turnuva takımlarını alalım (Takım ID'lerini eşleştirmek için)
  // World Cup id'si 1'dir.
  const teamsRes = await fetch(`${API_SPORTS_URL}/teams?league=1&season=2022`, { headers });
  const teamsData = await teamsRes.json();
  
  if (!teamsData.response) {
    console.error('Failed to fetch teams from api-football:', teamsData.errors);
    return;
  }

  const apiFootballTeams = teamsData.response.map((t: any) => t.team);
  
  // DB'deki kendi takımlarımız
  const dbTeams = await prisma.team.findMany();

  let processedCount = 0;

  for (const dbTeam of dbTeams) {
    // İsimleri eşleştir (örn: "England" == "England")
    // Bazı istisnai isimler için manual mapping gerekebilir ama genelde %90 aynıdır.
    let matchedApiTeam = apiFootballTeams.find((t: any) => 
      t.name.toLowerCase() === dbTeam.name.toLowerCase()
    );

    // Exception cases handling (e.g. "USA" vs "USA", "South Korea" vs "Korea Republic")
    if (!matchedApiTeam) {
      if (dbTeam.name === 'South Korea') matchedApiTeam = apiFootballTeams.find((t: any) => t.name === 'Korea Republic');
      if (dbTeam.name === 'USA') matchedApiTeam = apiFootballTeams.find((t: any) => t.name === 'USA');
      if (dbTeam.name === 'Iran') matchedApiTeam = apiFootballTeams.find((t: any) => t.name.includes('Iran'));
    }

    if (!matchedApiTeam) {
      console.log(`⚠️ Eşleşme bulunamadı: ${dbTeam.name}`);
      continue;
    }

    console.log(`📡 Kadro çekiliyor: ${dbTeam.name} (ID: ${matchedApiTeam.id})`);
    
    // API-Football'dan kadroyu çek
    const squadRes = await fetch(`${API_SPORTS_URL}/players/squads?team=${matchedApiTeam.id}`, { headers });
    const squadData = await squadRes.json();
    
    if (squadData.response && squadData.response.length > 0) {
      const players = squadData.response[0].players;
      
      for (const p of players) {
        await prisma.player.upsert({
          where: { extApiId: p.id },
          update: {
            name: p.name,
            position: p.position,
            shirtNum: p.number,
            age: p.age,
            photoUrl: p.photo
          },
          create: {
            extApiId: p.id,
            name: p.name,
            teamId: dbTeam.id,
            position: p.position,
            shirtNum: p.number,
            age: p.age,
            photoUrl: p.photo
          }
        });
      }
      processedCount++;
    }
    
    // Rate limit'e takılmamak için hafif bekleme
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`✅ SnycSquads: ${processedCount} takımın kadrosu başarıyla veritabanına işlendi.`);
}
