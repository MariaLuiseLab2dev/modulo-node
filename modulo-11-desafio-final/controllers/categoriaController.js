const { runQuery, getQuery, allQuery } = require('../database/database-helper');
const { NotFoundError } = require('../errors/apiError');
const { validarCategoria, validaIdCategoria } = require("../utils/utils-helper");

exports.createCategory = async (req, res, next) => {
    try {
        const { nome, status } = req.body;

        const { nomeNormalizado, status: statusNum } = await validarCategoria({ nome, status });
        
        const sqlInsert = `
            INSERT INTO categorias (nome, nome_normalizado, status) 
            VALUES (?, ?, ?)
        `;
        const result = await runQuery(sqlInsert, [nome, nomeNormalizado, statusNum]);

        return res.status(201).json({
            message: "Categoria criada com sucesso.",
            id: result.lastID,
            nome,
            nome_normalizado: nomeNormalizado,
            status: statusNum
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllCategories = async (req, res, next) => {
    try {
        const sqlSelectAll = `SELECT * FROM categorias`;
        const categorias = await allQuery(sqlSelectAll);
        return res.status(200).json(categorias);
    } catch (error) {
        next(error);
    }
}

exports.getCategoryById = async (req, res, next) => {
    try {
        // valida e obtém idCategoria
        const id = await validaIdCategoria(req.params.id_categoria);
        const params = [id];
        const sql = `SELECT * FROM categorias WHERE id_categoria = ?`;
        const categoria = await getQuery(sql, params);

        return res.status(200).json(categoria);
    } catch (error) {
        next(error);
    }
}

exports.updateCategoryById = async (req, res, next) => {
    try {
        const id_categoria = req.params.id_categoria;

        const idCategoriaValidado = await validaIdCategoria(id_categoria);

        const { nome, status } = req.body;

        // valida + normaliza + checa duplicidade
        const { nomeNormalizado, status: statusNum } = await validarCategoria({ nome, status }, idCategoriaValidado);

        // faz o UPDATE sobrescrevendo os campos
        const sqlUpdate = `
            UPDATE categorias
            SET nome = ?, nome_normalizado = ?, status = ?
            WHERE id_categoria = ?
        `;
        const result = await runQuery(sqlUpdate, [nome, nomeNormalizado, statusNum, idCategoriaValidado]);

        if (!result || result.changes === 0) {
            throw new NotFoundError(`Categoria ${idCategoriaValidado}`);
        }
        
        return res.json({ message: "Categoria atualizada com sucesso." });
    } catch (error) {
        next(error);
    }
};