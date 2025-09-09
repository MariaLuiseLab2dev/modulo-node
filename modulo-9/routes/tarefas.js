const express = require('express');
const router = express.Router();
const tarefaController = require('../controllers/tarefaController');

// Em vez de colocar a função de callback aqui, chamamos uma do controller
router.post('/', tarefaController.createTask);
router.get('/', tarefaController.getAllTasks);
router.get('/:id', tarefaController.getTaskById);
router.patch('/:id', tarefaController.updateTaskById);
router.delete('/:id', tarefaController.deleteTaskById);

module.exports = router;