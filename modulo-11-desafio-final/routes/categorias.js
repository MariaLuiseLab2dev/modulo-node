const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Em vez de colocar a função de callback aqui, chamamos uma do controller
router.post('/', categoriaController.createCategory);
router.get('/', categoriaController.getAllCategories);
router.get('/:id_categoria', categoriaController.getCategoryById);
router.put('/:id_categoria', categoriaController.updateCategoryById);
module.exports = router;