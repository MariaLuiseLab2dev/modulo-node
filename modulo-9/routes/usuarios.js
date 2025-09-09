const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/', usuarioController.createUser);
router.get('/', usuarioController.getAllUsers);
router.get('/:id', usuarioController.getUserById);
router.patch('/:id', usuarioController.updateUserById);
router.delete('/:id', usuarioController.deleteUserById);
router.post('/login', usuarioController.loginUser);

module.exports = router;