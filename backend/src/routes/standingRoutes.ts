import { Router } from 'express';
import { getStandings } from '../controllers/standingController';

const router = Router();

router.get('/', getStandings);

export default router;
