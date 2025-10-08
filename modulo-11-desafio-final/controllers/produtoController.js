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
        // pega o termo de busca da query string (ex.: /produtos?filtro=blabla)
        const termo = req.query.filtro || "";

        // SQL base
        let sqlSelectAll = `
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
        `;

        const params = [];

        // se veio termo de busca, filtra pelo nome do produto
        if (termo) {
            sqlSelectAll += " WHERE LOWER(p.nome) LIKE ?";
            params.push(`%${termo.toLowerCase()}%`);
        }

        sqlSelectAll += " ORDER BY p.id_produto ASC";

        const produtos = await allQuery(sqlSelectAll, params);
        return res.status(200).json(produtos);
    } catch (error) {
        next(error);
    }
};

exports.getProductsGrouped = async (req, res, next) => {
    try {
        const termo = req.query.filtro || "";

        let sql = `
        SELECT 
            p.id_produto,
            p.nome,
            p.descricao,
            p.preco,
            p.estoque,
            p.status,
            p.id_categoria,
            c.nome AS nome_categoria,
            c.status
        FROM produtos p
        JOIN categorias c 
        ON p.id_categoria = c.id_categoria
        WHERE p.status = 1 AND c.status = 1`;

        const params = [];
        if (termo) {
            sql += " AND LOWER(p.nome) LIKE ?";
            params.push(`%${termo.toLowerCase()}%`);
        }

        sql += " ORDER BY c.nome, p.id_produto ASC";

        const produtos = await allQuery(sql, params);

        // Agrupar por categoria
        const categorias = {}; // cria um objeto categorias pra por o a rray dos produtos
        produtos.forEach(produto => { // pra cada produto
            if (!categorias[produto.nome_categoria]) { // se aquela categoria Não existir no objeto
                categorias[produto.nome_categoria] = { 
                    // cria uma categoria
                    nome_categoria: produto.nome_categoria, // pegando o nome
                    quantidade: 0, // inicializando com 0
                    produtos: [] // u marray vazio pra pôr os produtos
                };
            } //se ja existir
            categorias[produto.nome_categoria].produtos.push(produto); // joga o nome do produto dentro do array
            categorias[produto.nome_categoria].quantidade++; // soma +1 na quantidade
        });

        return res.status(200).json(Object.values(categorias));
    } catch (error) {
        next(error);
    }
};

exports.getProductById = async (req, res, next) => {
    try {
        const id = req.params.id_produto;

        const idProdutoValido = await validaNumero(id);

        const sqlSelectProdutoPorId = `
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
        WHERE p.id_produto = ?
        `;
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