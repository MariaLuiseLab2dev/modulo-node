// controllers/tarefaController.js
const { runQuery, getQuery, allQuery } = require('../database/database-helper');

exports.createTask = async (req, res, next) => {
    try {
        const { titulo, descricao } = req.body;
        if (!titulo) {
            return res.status(400).json({ error: 'O título é obrigatório.' });
        }
        const sql = `INSERT INTO tarefas (titulo, descricao, concluida, data_criacao) VALUES (?,?, 0, datetime('now'))`;
        const result = await runQuery(sql, [titulo, descricao]);
        res.status(201).json({ message: "Tarefa criada com sucesso.", id: result.lastID, titulo, descricao, concluida: 0 });
    } catch (error) {
        next(error); // Passa o erro para o middleware de erro
    }
};

exports.getAllTasks = async (req, res, next) => {
    try {
        const sql = `SELECT * FROM tarefas`;
        const tarefas = await allQuery(sql);
         if (!tarefas || tarefas.length == 0) {
            return res.status(200).json({
                message: "Nenhuma tarefa cadastrado no sistema.",
            });
        }
        return res.status(200).json(tarefas);
    } catch (error) {
        next(error);
    }
};

exports.getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM tarefas WHERE id =?`;
        const tarefa = await getQuery(sql, [id]);
        if (!tarefa) {
            return res.status(404).json({ error: `Tarefa ${id} não encontrada.` });
        }
        res.status(200).json(tarefa);
    } catch (error) {
        next(error);
    }
};

// update - patch
exports.updateTaskById = async (req, res, next) => {
    const { id } = req.params;
    const { titulo, descricao, concluida } = req.body;
    try {
        let sql = '';
        let parametros = [];

        if (titulo && descricao && Object.hasOwn(req.body, 'concluida')) {
            sql = `UPDATE tarefas SET titulo = ?, descricao = ?, concluida = ? WHERE id = ?`;
            parametros = [titulo, descricao, concluida, id];

        } else if (titulo && descricao) {
            sql = `UPDATE tarefas SET titulo = ?, descricao = ? WHERE id = ?`;
            parametros = [titulo, descricao, id];

        } else if (titulo && Object.hasOwn(req.body, 'concluida')) {
            sql = `UPDATE tarefas SET titulo = ?, concluida = ? WHERE id = ?`;
            parametros = [titulo, concluida, id];
        
        } else if (descricao && Object.hasOwn(req.body, 'concluida')) {
            sql = `UPDATE tarefas SET descricao = ?, concluida = ? WHERE id = ?`;
            parametros = [descricao, concluida, id];

        } else if (titulo) {
            sql = `UPDATE tarefas SET titulo = ? WHERE id = ?`;
            parametros = [titulo, id];

        } else if (descricao) {
            sql = `UPDATE tarefas SET descricao = ? WHERE id = ?`;
            parametros = [descricao, id];

        } else if (Object.hasOwn(req.body, 'concluida')) {
            sql = `UPDATE tarefas SET concluida = ? WHERE id = ?`;
            parametros = [concluida, id];
        } else {
            return res.status(400).json({ error: "Nenhum campo válido enviado."});
        }

        const resultado = await runQuery(sql, parametros);

        if (resultado.changes == 0) {
            return res.status(404).json({ error: `Tarefa ${id} não encontrada.` });
        } 
        return res.status(200).json({ message: `Tarefa ${id} atualizada com sucesso.`});
    } catch (error) {
        next(error);
    }
};

//delete - delete
exports.deleteTaskById = async (req, res, next) => {
    const { id } = req.params;
    const params = id;
    try {
        const sql = `DELETE FROM tarefas WHERE id = ?`;
        const tarefaDeletada = await runQuery(sql, params);
        if (tarefaDeletada.changes == 0) {
            return res.status(404).json({error: `Tarefa ${id} não encontrada.` });
        }
        return res.status(200).json({ message: `Tarefa ${id} atualizada com sucesso.`});
    } catch(error) {
        next(error);
    }
};