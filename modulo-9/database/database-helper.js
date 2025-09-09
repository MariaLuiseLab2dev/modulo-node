// database-helper.js
const db = require('../database/database.js');

function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                console.error('Erro ao executar a query', err);
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Erro ao executar a query', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Erro ao executar a query', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// controllers/tarefaController.js
exports.getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM tarefas WHERE id =?`;
        const tarefa = await getQuery(sql, [id]);
        if (!tarefa) {
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }
        res.status(200).json(tarefa);
    } catch (error) {
        next(error);
    }
};

module.exports = { runQuery, getQuery, allQuery }