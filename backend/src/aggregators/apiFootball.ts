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
  console.log('🔄 SnycSquads: Kadrolar çekiliyor (TLA Kök Çözümü Aktif)...');
  
  const dbTeams = await prisma.team.findMany();
  let processedCount = 0;

  for (const dbTeam of dbTeams) {
    let matchedApiTeam = null;

    // 1. KÖKTEN ÇÖZÜM: Takımın uluslararası TLA kodunu kullanarak API-Football'da ara.
    // TLA (Örn: TUR, ARG, BRA, FRA) FIFA standardı olduğu için her zaman en doğru sonucu verir.
    if (dbTeam.tla) {
      const codeRes = await fetch(`${API_SPORTS_URL}/teams?code=${dbTeam.tla}`, { headers });
      const codeData = await codeRes.json();
      
      if (codeData.response && codeData.response.length > 0) {
        // API bazen aynı koda sahip birden fazla milli takım (Örn: TUR -> Türkiye, Turkmenistan) döndürebilir.
        // Bu yüzden "national: true" olan ve ismi bizim veritabanındaki takım ismine benzeyen ilk takımı alıyoruz.
        matchedApiTeam = codeData.response.find((t: any) => 
          t.team.national === true && 
          (t.team.name.toLowerCase().includes(dbTeam.name.toLowerCase().substring(0,4)) || 
           dbTeam.name.toLowerCase().includes(t.team.name.toLowerCase().substring(0,4)) ||
           t.team.country.toLowerCase() === dbTeam.name.toLowerCase())
        )?.team;

        // İsim benzerliği ile bulamazsak (Örn: USA vs United States), sadece national: true olan ilk takımı al.
        if (!matchedApiTeam) {
          matchedApiTeam = codeData.response.find((t: any) => t.team.national === true)?.team;
        }
      }
    }

    // 2. FALLBACK (Nadir Durumlar İçin): Eğer TLA koduyla bulunamazsa direkt isimle arama yap.
    if (!matchedApiTeam) {
      console.log(`🔍 TLA kodu (${dbTeam.tla}) ile bulunamadı, isimle aranıyor: ${dbTeam.name}`);
      const searchRes = await fetch(`${API_SPORTS_URL}/teams?search=${dbTeam.name}`, { headers });
      const searchData = await searchRes.json();
      
      if (searchData.response && searchData.response.length > 0) {
        matchedApiTeam = searchData.response.find((t: any) => t.team.national === true)?.team;
        if (!matchedApiTeam) matchedApiTeam = searchData.response[0].team;
      }
    }

    if (!matchedApiTeam) {
      console.log(`⚠️ Eşleşme hiçbir şekilde bulunamadı: ${dbTeam.name} (${dbTeam.tla})`);
      continue;
    }

    console.log(`📡 Kadro çekiliyor: ${dbTeam.name} -> Eşleştiği API Takımı: ${matchedApiTeam.name} (ID: ${matchedApiTeam.id})`);
    
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
