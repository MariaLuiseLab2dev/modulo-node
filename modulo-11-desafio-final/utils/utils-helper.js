// database/utils-helper.js
const { getQuery, allQuery, runQuery } = require("../database/database-helper");
const { DuplicateError, ValidationError, NotFoundError } = require("../errors/apiError");

const DUPLICIDADE_CONFIG = {
    categoria: { table: "categorias", idCol: "id_categoria" },
    produto: { table: "produtos", idCol: "id_produto" },
    pedido: { table: "pedidos", idCol: "id_pedido" }
};

async function normalizarString(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

async function validaString(nomeCampo, valorDaString) {
    if (
        !nomeCampo ||
        !valorDaString ||
        typeof nomeCampo !== "string" ||
        typeof valorDaString !== "string" ||
        valorDaString.trim() === ""
    ) {
        throw new ValidationError(nomeCampo, "Deve ser uma string não vazia.");
    }

    const nomeNormalizado = await normalizarString(valorDaString);
    return { nomeValidado: valorDaString.trim(), nomeNormalizado };
}

async function validaStatus(status) {
    const statusNum = Number(status);
    if (!Number.isInteger(statusNum) || (statusNum !== 0 && statusNum !== 1)) {
        throw new ValidationError("status", "Deve ser 0 (invisível) ou 1 (visível).");
    }
    return statusNum;
}

async function validaPreco(preco) {
    const precoNum = Number(preco);
    if (!Number.isFinite(precoNum) || precoNum < 0) {
        throw new ValidationError("preço", "Deve ser um número maior ou igual a zero");
    }
    return precoNum;
}

async function validaEstoque(estoque) {
    const estoqueNum = Number(estoque);
    if (!Number.isInteger(estoqueNum) || estoqueNum < 0) {
        throw new ValidationError("estoque", "Deve ser um número maior ou igual a zero");
    }
    return estoqueNum;
}

async function validaNumero(numero) {
    const numeroValidado = Number(numero);
    if (!Number.isInteger(numeroValidado) || numeroValidado < 0) {
        throw new ValidationError("id", "deve ser um número inteiro maior que zero");
    }
    return numeroValidado;
}

async function checaDuplicidade(tabela, nomeNormalizado, id = null) {
    const escolha = DUPLICIDADE_CONFIG[tabela];
    if (!escolha) throw new Error("Tabela inválida para checar a duplicidade.");

    const { table, idCol } = escolha;

    const sql = `
        SELECT COUNT(*) AS qtd
        FROM ${table} 
        WHERE nome_normalizado = ?
        AND ${idCol} IS NOT ?
        `;
    const params = [nomeNormalizado, id];

    const result = await getQuery(sql, params);
    if (result.qtd > 0) {
        throw new DuplicateError(tabela, nomeNormalizado);
    }
}


async function validaIdCategoria(idParam) {
    const id = await validaNumero(idParam);

    const sql = `SELECT 1 FROM categorias WHERE id_categoria = ?`;
    const row = await getQuery(sql, [id]);
    if (!row) {
        throw new NotFoundError(`Categoria ${id}`);
    }

    return id;
}

async function validaIdProduto(idParam) {
    const id = await validaNumero(idParam);

    const sql = `SELECT 1 FROM produtos WHERE id_produto = ?`;
    const row = await getQuery(sql, [id]);
    if (!row) {
        throw new NotFoundError(`Produto ${id}`);
    }

    return id;
}

async function validaIdPedido(idParam) {
    const id = await validaNumero(idParam);

    const sql = `SELECT 1 FROM pedidos WHERE id_pedido = ?`;
    const row = await getQuery(sql, [id]);
    if (!row) {
        throw new NotFoundError(`Pedido ${id}`);
    }

    return id;
}

async function validaIdCarrinho(idParam) {
    const id = await validaNumero(idParam);

    const sql = `SELECT 1 FROM carrinhos WHERE id_carrinho = ?`;
    const row = await getQuery(sql, [id]);
    if (!row) {
        throw new NotFoundError(`Carrinho ${id}`);
    }

    return id;
}

async function validaIdItem(idParam) {
    const id = await validaNumero(idParam);

    const sql = `SELECT 1 FROM itens_carrinho WHERE id_item = ?`;
    const row = await getQuery(sql, [id]);
    if (!row) {
        throw new NotFoundError(`Item ${id}`);
    }

    return id;
}

async function verificaEstoque(id_categoria, novoEstoque, idProdutoIgnorar = null) {
    // pega a soma dos estoques daqueles produtos daquela categoria
    let sqlSomaEstoque = `
        SELECT SUM(estoque) AS totalEstoque
        FROM produtos
        WHERE id_categoria = ?
    `;
    const params = [id_categoria];

    if (idProdutoIgnorar) { // pra caso for atualizar e ele ignorar o próprio id quando for fazer select
        sqlSomaEstoque += ` AND id_produto != ?`;
        params.push(idProdutoIgnorar);
    }

    const resultadoSoma = await getQuery(sqlSomaEstoque, params);

    let estoqueAtual = 0;

    if (resultadoSoma) { // se existir
        estoqueAtual = resultadoSoma.totalEstoque; // adiciona
    }

    const estoqueFinal = estoqueAtual + novoEstoque;

    if (estoqueFinal > 100) {
        throw new ValidationError(
            "estoque",
            `O estoque total da categoria não pode ultrapassar 100 unidades. Estoque atual: ${estoqueAtual}.`
        )
    };

    return {
        estoqueAtual,
        novoEstoque,
        estoqueFinal
    };
}

async function validarCategoria({ nome, status }, id = null) {
    const { nomeValidado, nomeNormalizado } = await validaString("nome", nome);
    await checaDuplicidade("categoria", nomeNormalizado, id);
    const statusNum = await validaStatus(status);
    return { nome: nomeValidado, nomeNormalizado, status: statusNum };
}

async function validarProduto(
    { nome, descricao, id_categoria, preco, estoque, status },
    idIgnore = null) {
    const { nomeValidado, nomeNormalizado } = await validaString("nome", nome);
    const { nomeValidado: descValidada } = await validaString("descricao", descricao);

    const precoNum = await validaPreco(preco);
    const estoqueNum = await validaEstoque(estoque);
    const statusNum = await validaStatus(status);

    await checaDuplicidade("produto", nomeNormalizado, idIgnore);

    await verificaEstoque(id_categoria, estoqueNum, idIgnore);

    const sqlCategoria = `SELECT id_categoria FROM categorias WHERE id_categoria = ?`;
    const categoria = await getQuery(sqlCategoria, [id_categoria]);
    if (!categoria) {
        throw new NotFoundError(`Categoria ${id}`);
    }

    return {
        nome: nomeValidado,
        nomeNormalizado,
        descricao: descValidada,
        preco: precoNum,
        estoque: estoqueNum,
        status: statusNum,
        idCategoria: categoria.id_categoria
    };
}

async function validarPedido({ itens }) {
    if (!Array.isArray(itens) || itens.length === 0) {
        throw new ValidationError("itens", "O pedido deve conter pelo menos um item.");
    }

    let valor_total = 0;
    const itensValidados = [];

    for (const item of itens) { // itera sobre os itens que vem do json
        const { id_produto, quantidade } = item; // pra cada item eu tenho o id do produto e q qtd

        // Valida se o produto existe
        const idProdutoValidado = await validaIdProduto(id_produto);

        // Valida quantidade
        const quantidadeNumEstoque = await validaEstoque(quantidade); // já garante > 0 e inteiro

        // Busca preço e estoque atual do produto
        const sqlProduto = `
            SELECT preco, estoque
            FROM produtos
            WHERE id_produto = ?
        `;
        const produto = await getQuery(sqlProduto, [idProdutoValidado]);

        if (!produto) { // se aquele produto n existir
            throw new NotFoundError(`Produto ${idProdutoValidado}`);
        }

        // Verifica estoque suficiente
        if (produto.estoque < quantidadeNumEstoque) {
            throw new ValidationError(
                "estoque",
                `Estoque insuficiente para o produto ${idProdutoValidado}. Disponível: ${produto.estoque}`
            );
        }

        // Soma no valor total
        valor_total += produto.preco * quantidadeNumEstoque;

        // Adiciona item validado à lista
        itensValidados.push({
            id_produto: idProdutoValidado,
            quantidade: quantidadeNumEstoque,
            preco_unitario: produto.preco
        });
    }

    return {
        valor_total,
        itens: itensValidados
    };
}

async function buscaItensCarrinho(id_carrinho) {
    return allQuery(
        `SELECT ic.id_item, 
                ic.id_produto, 
                ic.quantidade, 
                ic.preco,
                ic.id_produto,
                p.nome,
                p.estoque,
                p.descricao
        FROM itens_carrinho ic
        JOIN produtos p 
        ON ic.id_produto = p.id_produto
        WHERE ic.id_carrinho = ?`,
        [id_carrinho]
    );
}

// verifica se a soma (quantidadeExistenteNoCarrinho + quantidadeAdicional) <= estoqueProduto
async function verificaEstoqueProduto(id_produto, quantidadeAdicional, id_carrinho = null) {
    // pega estoque atual do produto
    const sqlProduto = `SELECT estoque FROM produtos WHERE id_produto = ?`;

    const produto = await getQuery(sqlProduto, [id_produto]);
    // Busca o estoque atual do produto no banco
    if (!produto) throw new NotFoundError(`Produto ${id_produto}`);
    // Se o produto já está sem estoque, não pode ser adicionado
    if (produto.estoque === 0) {
        throw new ValidationError(
            "estoque",
            `Produto ${id_produto} está sem estoque e não pode ser adicionado ao carrinho.`
        );
    }

    // Se for passado um carrinho, soma a quantidade já existente desse produto no carrinho
    let quantidadeNoCarrinho = 0;
    if (id_carrinho) {
        const sqlQtdNoCarrinho = `
        SELECT SUM(quantidade) AS total
        FROM itens_carrinho
        WHERE id_carrinho = ? AND id_produto = ?
    `;
        const row = await getQuery(sqlQtdNoCarrinho, [id_carrinho, id_produto]);
        quantidadeNoCarrinho = row ? (row.total || 0) : 0;
    }
    // Calcula o total desejado (o que já tem + o que o usuário quer adicionar)
    const totalDesejado = quantidadeNoCarrinho + Number(quantidadeAdicional);
    
    // Se o total desejado ultrapassa o estoque disponivel
    if (totalDesejado > produto.estoque) {
        throw new ValidationError(
            "estoque",
            `Estoque insuficiente para o produto ${id_produto}. Disponível: ${produto.estoque}, no carrinho já: ${quantidadeNoCarrinho}`
        );
    }

    return {
        estoqueProduto: produto.estoque,
        quantidadeNoCarrinho,
        totalDesejado
    };
}


module.exports = {
    validarCategoria,
    validarProduto,
    validaIdCategoria,
    validaIdPedido,
    validaIdProduto,
    validaIdCarrinho,
    validaIdItem,
    validaNumero,
    validaEstoque,
    validarPedido,
    buscaItensCarrinho,
    verificaEstoque,
    verificaEstoqueProduto
};
