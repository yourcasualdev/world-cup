import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const FOOTBALL_DATA_URL = 'https://api.football-data.org/v4';
const token = process.env.FOOTBALL_DATA_API_KEY;

async function dumpSchemas() {
  const headers = { 'X-Auth-Token': token as string };
  const schemas: any = {};

  try {
    // Team Schema
    const teamsRes = await fetch(`${FOOTBALL_DATA_URL}/competitions/WC/teams`, { headers });
    const teamsData = await teamsRes.json();
    schemas.teamSample = teamsData.teams?.[0] || {};

    // Match Schema
    const matchesRes = await fetch(`${FOOTBALL_DATA_URL}/competitions/WC/matches`, { headers });
    const matchesData = await matchesRes.json();
    schemas.matchSample = matchesData.matches?.[0] || {};

    // Standings Schema
    const stdRes = await fetch(`${FOOTBALL_DATA_URL}/competitions/WC/standings`, { headers });
    const stdData = await stdRes.json();
    schemas.standingSample = stdData.standings?.[0] || {};

    fs.writeFileSync('/Users/yourcasualdev/.gemini/antigravity/brain/cbdeb0b5-13c5-47a0-9f21-4ffb680e90cd/scratch/football_data_schema.json', JSON.stringify(schemas, null, 2));
    console.log('Schema dump created successfully.');
  } catch(e) {
    console.error('Error dumping schemas', e);
  }
}

dumpSchemas();
