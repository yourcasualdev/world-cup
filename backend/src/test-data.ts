import dotenv from 'dotenv';
dotenv.config();

const FOOTBALL_DATA_URL = 'https://api.football-data.org/v4';
const token = process.env.FOOTBALL_DATA_API_KEY;

async function fetchWorldCupData() {
  if (!token) {
    console.error('API_KEY bulunamadı!');
    return;
  }

  const headers = { 'X-Auth-Token': token };

  try {
    console.log('--- TURNUVA BİLGİSİ ---');
    const compRes = await fetch(`${FOOTBALL_DATA_URL}/competitions/WC`, { headers });
    const compData = await compRes.json();
    console.log(`Turnuva: ${compData.name} (${compData.code})`);
    console.log(`Sezon: ${compData.currentSeason?.startDate} - ${compData.currentSeason?.endDate}`);
    
    console.log('\n--- TAKIMLAR (Örnek İlk 3) ---');
    const teamsRes = await fetch(`${FOOTBALL_DATA_URL}/competitions/WC/teams`, { headers });
    const teamsData = await teamsRes.json();
    if (teamsData.teams && teamsData.teams.length > 0) {
      console.log(`Toplam Takım: ${teamsData.teams.length}`);
      teamsData.teams.slice(0, 3).forEach((team: any) => {
        console.log(`- ${team.name} (Kısaltma: ${team.tla}) | Bayrak: ${team.crest}`);
      });
    } else {
      console.log('Bu sezon için takım verisi henüz yok veya format farklı:', teamsData.message || 'Veri boş');
    }

    console.log('\n--- FİKSTÜR/MAÇLAR (Örnek İlk 3) ---');
    const matchesRes = await fetch(`${FOOTBALL_DATA_URL}/competitions/WC/matches`, { headers });
    const matchesData = await matchesRes.json();
    if (matchesData.matches && matchesData.matches.length > 0) {
      console.log(`Toplam Maç: ${matchesData.matches.length}`);
      matchesData.matches.slice(0, 3).forEach((match: any) => {
        console.log(`- ${match.utcDate} | ${match.homeTeam?.name || 'Belli Değil'} vs ${match.awayTeam?.name || 'Belli Değil'} | Durum: ${match.status}`);
      });
    } else {
      console.log('Bu sezon için maç verisi henüz girilmemiş:', matchesData.message || 'Veri boş');
    }

  } catch (error) {
    console.error('Hata oluştu:', error);
  }
}

fetchWorldCupData();
