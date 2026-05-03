import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
dotenv.config();

const prisma = new PrismaClient();
const API_SPORTS_URL = 'https://v3.football.api-sports.io';
const key = process.env.API_FOOTBALL_KEY;
const headers = { 'x-apisports-key': key };

async function fix() {
  const dbTeam = await prisma.team.findFirst({ where: { name: 'Turkey' } });
  if (!dbTeam) return console.log('Team not found in DB');

  const squadRes = await fetch(`${API_SPORTS_URL}/players/squads?team=777`, { headers });
  const squadData = await squadRes.json();
  
  if (squadData.response && squadData.response.length > 0) {
    const players = squadData.response[0].players;
    let count = 0;
    for (const p of players) {
      await prisma.player.upsert({
        where: { extApiId: p.id },
        update: { name: p.name, position: p.position, shirtNum: p.number, age: p.age, photoUrl: p.photo },
        create: { extApiId: p.id, name: p.name, teamId: dbTeam.id, position: p.position, shirtNum: p.number, age: p.age, photoUrl: p.photo }
      });
      count++;
    }
    console.log(`Success! Added ${count} players for Turkey.`);
  } else {
    console.log('Failed:', squadData);
  }
}
fix().finally(() => prisma.$disconnect());
