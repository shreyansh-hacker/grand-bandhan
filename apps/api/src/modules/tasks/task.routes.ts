import { Router } from 'express';
import { listTasks, createTask, updateTask, regeneratePlan } from './task.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, listTasks);
router.post('/', authenticate, createTask);
router.patch('/:id', authenticate, updateTask);
router.post('/regenerate', authenticate, regeneratePlan);

export default router;
