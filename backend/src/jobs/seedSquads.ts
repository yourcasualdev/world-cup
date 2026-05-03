import { syncSquads } from '../aggregators/apiFootball';
import prisma from '../db';

async function seedSquadsDatabase() {
  try {
    console.log('🚀 Kadro (Squads) Seed İşlemi Başlıyor...');
    
    await syncSquads();

    console.log('🎉 Tüm oyuncular başarıyla kendi veritabanımıza eklendi!');
    
    const totalPlayers = await prisma.player.count();
    console.log(`\n📊 KENDİ VERİTABANIMIZIN DURUMU:`);
    console.log(`   Oyuncu Sayısı: ${totalPlayers}`);

  } catch (error) {
    console.error('❌ Seed işleminde hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSquadsDatabase();
