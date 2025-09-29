const { runQuery, getQuery, allQuery } = require('../database/database-helper');
const { NotFoundError } = require('../errors/apiError');
const { validarProduto, validaNumero, validaIdProduto } = require('../utils/utils-helper');

exports.createProduct = async (req, res, next) => {
    try {
        const { nome, descricao, id_categoria, preco, estoque, status } = req.body

        const obrigatorios = [
            "nome",
            "descricao",
            "id_categoria",
            "preco",
            "estoque",
            "status"
        ]
        for (const campo of obrigatorios) {
            if (!Object.hasOwn(req.body, campo)) {
                throw new NotFoundError(campo);
            }
        }

        // valida tudo: nome, descrição, duplicidade, preço, estoque, status, categoria existe
        const {
            nome: nomeValidado,
            nomeNormalizado,
            descricao: descricaoValidada,
            preco: precoNum,
            estoque: estoqueNum,
            status: statusNum,
            idCategoria
        } = await validarProduto(
            { nome, descricao, id_categoria, preco, estoque, status }
        );

        const sqlInsert = `
            INSERT INTO produtos
            (nome, nome_normalizado, descricao, preco, estoque, status, id_categoria)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
        const result = await runQuery(sqlInsert, [
            nomeValidado,
            nomeNormalizado,
            descricaoValidada,
            precoNum,
            estoqueNum,
            statusNum,
            idCategoria
        ])

        return res.status(201).json({
            message: 'Produto criado com sucesso.',
            id: result.lastID,
            nome: nomeValidado,
            nome_normalizado: nomeNormalizado,
            descricao: descricaoValidada,
            preco: precoNum,
            estoque: estoqueNum,
            status: statusNum,
            id_categoria: idCategoria
        })
    } catch (error) {
        next(error);
    }
}

exports.getAllProducts = async (req, res, next) => {
    try {
        const sqlSelectAll = `
        SELECT 
            p.id_produto,
            p.nome,
            p.descricao,
            p.preco,
            p.estoque,
            p.status,
            p.id_categoria,
            c.nome AS nome_categoria
        FROM produtos p
        JOIN categorias c 
        ON p.id_categoria = c.id_categoria
        ORDER BY p.id_produto ASC
        `;
        const produtos = await allQuery(sqlSelectAll);
        return res.status(200).json(produtos)
    } catch (error) {
        next(error);
    }
}

exports.getProductById = async (req, res, next) => {
    try {
        const id = req.params.id_produto;

        const idProdutoValido = await validaNumero(id);

        const sqlSelectProdutoPorId = `SELECT * FROM produtos WHERE id_produto = ?`;
        const params = [idProdutoValido];

        const produto = await getQuery(sqlSelectProdutoPorId, params);

        if (!produto) {
           throw new NotFoundError(`Produto ${idProdutoValido}`);
        }

        return res.status(200).json(produto);
    } catch (error) {
        next(error);
    }
}

exports.updateProductById = async (req, res, next) => {
    try {
        const id = Number(req.params.id_produto)

        const idProdutoValido = await validaIdProduto(id);

        const { nome, descricao, id_categoria, preco, estoque, status } = req.body
        const obrigatorios = [
            "nome",
            "descricao",
            "id_categoria",
            "preco",
            "estoque",
            "status"
        ]
        for (const campo of obrigatorios) {
            if (!Object.hasOwn(req.body, campo)) {
                throw new NotFoundError(campo);
            }
        }

        const {
            nome: nomeValidado,
            nomeNormalizado,
            descricao: descricaoValidada,
            preco: precoNum,
            estoque: estoqueNum,
            status: statusNum,
            idCategoria
        } = await validarProduto(
            { nome, descricao, id_categoria, preco, estoque, status },
            idProdutoValido
        )

        const sqlUpdate = `
            UPDATE produtos
            SET
            nome            = ?,
            nome_normalizado= ?,
            descricao       = ?,
            preco           = ?,
            estoque         = ?,
            status          = ?,
            id_categoria    = ?
            WHERE id_produto = ?
        `;
        const result = await runQuery(sqlUpdate, [
            nomeValidado,
            nomeNormalizado,
            descricaoValidada,
            precoNum,
            estoqueNum,
            statusNum,
            idCategoria,
            idProdutoValido
        ])

        if (!result.changes) {
           throw new NotFoundError(`Produto ${idProdutoValido}`);
        }

        return res.json({ message: "Produto atualizado com sucesso." })
    } catch (error) {
        next(error);
    }
}