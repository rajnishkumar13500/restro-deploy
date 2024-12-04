import express from 'express';
import { RestaurantController } from './restaurant.controller';

const router = express.Router();

router.get('/', RestaurantController.getAllRestaurant);
router.post('/', RestaurantController.createRestaurant);
// router.get('/:id', RestaurantController.getRestaurantById);
router.put('/:id', RestaurantController.updateRestaurant);
router.delete('/:id', RestaurantController.deleteRestaurant);
router.post('/sendotp',RestaurantController.sendOTP);
router.post('/verifyOTP',RestaurantController.verifyOTP);

export const RestaurantRouter = router;

