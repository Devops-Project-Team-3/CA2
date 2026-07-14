/*
  Owner: Yuki
  Feature: Study Planner CRUD
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Yuki's Study Planner CRUD feature.
*/

import express from 'express';
import {
  createPlannerPlaceholder,
  deletePlannerPlaceholder,
  getPlannerPlaceholder,
  updatePlannerPlaceholder
} from '../controllers/plannerController-Yuki.js';

const router = express.Router();

router.get('/', getPlannerPlaceholder);
router.post('/', createPlannerPlaceholder);
router.put('/:id', updatePlannerPlaceholder);
router.delete('/:id', deletePlannerPlaceholder);

export default router;
