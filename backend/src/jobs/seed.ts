import { syncTeams, syncMatches, syncStandings } from '../aggregators/footballData';
import prisma from '../db';

async function seedDatabase() {
  try {
    console.log('🚀 Veritabanı Seed İşlemi Başlıyor...');
    
    // 1. Önce Takımları Senkronize Et
    await syncTeams();
    
    // 2. Takımlar oluştuktan sonra Maçları Senkronize Et
    await syncMatches();
    
    // 3. Puan Durumlarını ve Grupları Senkronize Et
    await syncStandings();

    console.log('🎉 Tüm veriler başarıyla kendi veritabanımıza kopyalandı!');
    
    // Test sorgusu atalım
    const totalTeams = await prisma.team.count();
    const totalMatches = await prisma.match.count();
    console.log(`\n📊 KENDİ VERİTABANIMIZIN DURUMU:`);
    console.log(`   Takım Sayısı: ${totalTeams}`);
    console.log(`   Maç Sayısı: ${totalMatches}`);

  } catch (error) {
    console.error('❌ Seed işleminde hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
