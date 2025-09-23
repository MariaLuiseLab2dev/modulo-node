const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.post('/', pedidoController.createOrder);
router.get('/', pedidoController.getAllOrders);
router.get('/:id_pedido', pedidoController.getOrderById);

module.exports = router;