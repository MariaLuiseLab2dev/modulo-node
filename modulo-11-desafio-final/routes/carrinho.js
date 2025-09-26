const express = require('express');
const router = express.Router();
const carrinhoController = require('../controllers/carrinhoController');

router.post('/', carrinhoController.createCart);
router.get('/:id_carrinho', carrinhoController.getCartById);
router.post('/:id_carrinho', carrinhoController.addItemToCart);
router.patch('/:id_carrinho/item/:id_item', carrinhoController.updateItemQuantity);
router.delete('/:id_carrinho/item/:id_item', carrinhoController.deleteItemCart); 
router.post('/checkout/:id_carrinho', carrinhoController.checkoutCart);

module.exports = router;