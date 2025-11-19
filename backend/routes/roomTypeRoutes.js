import express from 'express';
import { getAllRoomTypes, createRoomType, updateRoomType, deleteRoomType, getRoomTypeById, getReviewsForRoomType } from '../controllers/roomTypeController.js';
import upload from '../config/multerConfig.js';
const router = express.Router();

router.get('/', getAllRoomTypes);
router.post('/', upload.single('photo'), createRoomType);
router.get('/:id', getRoomTypeById);
router.get('/:id/reviews', getReviewsForRoomType);
router.put('/:id', upload.single('photo'), updateRoomType);
router.delete('/:id', deleteRoomType);

export default router;