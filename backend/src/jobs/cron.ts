import cron from 'node-cron';
import { syncTeams, syncMatches, syncStandings } from '../aggregators/footballData';

export const startCronJobs = () => {
  console.log('⏰ Cron Jobs başlatılıyor...');

  // Her gün gece 03:00'te (Idle Update)
  // Takımları, stadyumları ve grupları senkronize et
  cron.schedule('0 3 * * *', async () => {
    console.log('--- GÜNLÜK RUTİN SENKRONİZASYON BAŞLADI ---');
    try {
      await syncTeams();
      await syncStandings();
    } catch (error) {
      console.error('Günlük senkronizasyon hatası:', error);
    }
  });

  // Her 30 dakikada bir (Fikstür Update)
  cron.schedule('*/30 * * * *', async () => {
    console.log('--- FİKSTÜR/MAÇ SENKRONİZASYON BAŞLADI ---');
    try {
      await syncMatches();
      // Not: İleride burada oynanan canlı maçları tespit edip, 
      // canlı maç varsa 30 saniyede bir tetiklenen bir interval başlatabiliriz.
      // Şimdilik 30 dakikada bir skorları güncelleyecek.
    } catch (error) {
      console.error('Fikstür senkronizasyon hatası:', error);
    }
  });
};
