import { Request, Response } from 'express';
import prisma from '../db';

export const getStandings = async (req: Request, res: Response) => {
  try {
    const standings = await prisma.group.findMany({
      include: {
        standings: {
          orderBy: { position: 'asc' },
          include: {
            team: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, count: standings.length, data: standings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
