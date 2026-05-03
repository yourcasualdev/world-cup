import { Request, Response } from 'express';
import prisma from '../db';
import { getCache, setCache } from '../utils/redis';

export const getMatches = async (req: Request, res: Response) => {
  try {
    const { status, date } = req.query;
    
    // Redis Cache Anahtarı Oluştur
    const cacheKey = `matches_${status || 'all'}_${date || 'all'}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.json({ success: true, count: cachedData.length, data: cachedData, source: 'cache' });
    }

    // Filtreleme objesi oluştur
    const where: any = {};
    if (status) where.status = String(status).toUpperCase();
    if (date) {
      // YYYY-MM-DD formatında bekliyoruz
      const startDate = new Date(String(date));
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(String(date));
      endDate.setHours(23, 59, 59, 999);
      
      where.matchDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const matches = await prisma.match.findMany({
      where,
      orderBy: { matchDate: 'asc' },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true
      }
    });

    // Sonucu 30 saniyeliğine Redis'e kaydet (Canlı maç trafiğini kaldırmak için)
    await setCache(cacheKey, matches, 30);

    res.json({ success: true, count: matches.length, data: matches, source: 'database' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getMatchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true
      }
    });

    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    res.json({ success: true, data: match });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
