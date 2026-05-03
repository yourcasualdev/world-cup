import { Request, Response } from 'express';
import prisma from '../db';

export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: {
        group: true
      }
    });

    res.json({ success: true, count: teams.length, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        group: true,
        players: true,
        homeMatches: { include: { awayTeam: true } },
        awayMatches: { include: { homeTeam: true } }
      }
    });

    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
