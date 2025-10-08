const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

router.post('/', produtoController.createProduct);
router.get('/', produtoController.getAllProducts);
router.get('/categorias', produtoController.getProductsGrouped);
router.get('/:id_produto', produtoController.getProductById);
router.put('/:id_produto', produtoController.updateProductById);

module.exports = router;