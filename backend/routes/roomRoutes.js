import express from 'express';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.get('/', getAllRooms);
router.post('/', createRoom);
router.put('/:id', upload.single('photo'), updateRoom);
router.delete('/:id', upload.single('photo'), deleteRoom);

export default router;