import { Router } from 'express';
import { getTeams, getTeamById } from '../controllers/teamController';

const router = Router();

router.get('/', getTeams);
router.get('/:id', getTeamById);

export default router;
