const express = require('express');
const router = express.Router();

const FoodController = require('../../controllers/FoodManagement/FoodController');

router.get('/', FoodController.getFood);
router.get('/:id', FoodController.viewOneFood);
router.post('/', FoodController.AddFood);
router.put('/:id', FoodController.UpdateFood);
router.delete('/:id', FoodController.deleteFood);

module.exports = router;