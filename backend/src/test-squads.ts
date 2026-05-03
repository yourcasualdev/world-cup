import dotenv from 'dotenv';
dotenv.config();

const key = process.env.API_FOOTBALL_KEY;

async function testSquad() {
  console.log('Fetching squad for team 10 (England)...');
  const res = await fetch('https://v3.football.api-sports.io/players/squads?team=10', {
    headers: { 'x-apisports-key': key as string }
  });
  const data = await res.json();
  console.log(JSON.stringify(data.response?.[0], null, 2));
}

testSquad();
