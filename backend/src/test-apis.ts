import dotenv from 'dotenv';
dotenv.config();

async function testFootballData() {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) return console.log('❌ FOOTBALL_DATA_API_KEY eksik!');

  console.log('⏳ football-data.org test ediliyor...');
  try {
    const res = await fetch('https://api.football-data.org/v4/competitions/WC', {
      headers: { 'X-Auth-Token': token },
    });
    const data = await res.json();
    
    if (res.ok) {
      console.log('✅ football-data.org BAŞARILI! Turnuva:', data.name);
    } else {
      console.log('❌ football-data.org HATASI:', data.message || res.statusText);
    }
  } catch (error) {
    console.log('❌ football-data.org İSTEK HATASI:', (error as Error).message);
  }
}

async function testApiFootball() {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return console.log('❌ API_FOOTBALL_KEY eksik!');

  console.log('\n⏳ API-Football test ediliyor...');
  try {
    const res = await fetch('https://v3.football.api-sports.io/status', {
      headers: { 'x-apisports-key': key },
    });
    const data = await res.json();
    
    if (res.ok && data.errors && Object.keys(data.errors).length === 0) {
      console.log('✅ API-Football BAŞARILI!');
      console.log('   Hesap Bilgileri:', data.response.account.firstname, data.response.account.lastname);
      console.log(`   Günlük Limit: ${data.response.requests.limit_day}, Kullanılan: ${data.response.requests.current}`);
    } else {
      console.log('❌ API-Football HATASI:', data.errors || res.statusText);
    }
  } catch (error) {
    console.log('❌ API-Football İSTEK HATASI:', (error as Error).message);
  }
}

async function runTests() {
  await testFootballData();
  await testApiFootball();
}

runTests();
