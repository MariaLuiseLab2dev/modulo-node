const { runQuery, getQuery, allQuery } = require('../database/database-helper');
const { NotFoundError, ValidationError } = require('../errors/apiError');
const { validaIdCarrinho, validaEstoque, validaIdProduto, verificaEstoqueProduto, buscaItensCarrinho, validaIdItem } = require("../utils/utils-helper");

exports.createCart = async (req, res, next) => {
    try {
        // cria carrinho
        const sqlInsertCarrinho = `INSERT INTO carrinhos DEFAULT VALUES`;
        const resultadoCarrinho = await runQuery(sqlInsertCarrinho, []);
        const id_carrinho = resultadoCarrinho.lastID;

        // retorna os itens do carrinho
        const sqlItensCarrinho = `SELECT * FROM itens_carrinho WHERE id_carrinho = ?`;
        const itensCarrinho = await allQuery(sqlItensCarrinho, [id_carrinho]);

        return res.status(201).json({
            message: `Carrinho ${id_carrinho} criado com sucesso`,
            id_carrinho,
            data_criacao: new Date().toISOString(),
            itens_carrinho: itensCarrinho
        });
    } catch (error) {
        next(error);
    }
};

exports.addItemToCart = async (req, res, next) => {
    try {
        const { id_carrinho } = req.params;
        const { id_produto, quantidade } = req.body;

        // valida id carrinho
        const idCarrinho = await validaIdCarrinho(id_carrinho);

        // valida o id do produto
        const idProdutoValidado = await validaIdProduto(id_produto);

        //valida quantidade
        const qtdValidada = await validaEstoque(quantidade);

        // busca preco do produto
        const sqlProduto = `SELECT preco, estoque FROM produtos WHERE id_produto = ?`;
        const produtoBuscado = await getQuery(sqlProduto, [idProdutoValidado]);
        console.log(produtoBuscado);
        if (!produtoBuscado) {
            throw new NotFoundError(`Produto ${idProdutoValidado}`);
        }

        // verifica se a soma do que ja tem, ultrapassa o estoque
        await verificaEstoqueProduto(idProdutoValidado, quantidade, idCarrinho);

        // checa se já tem esse item no carrinho
        const sqlSelectItem = `SELECT * FROM itens_carrinho WHERE id_carrinho = ? AND id_produto = ?`;
        const itemExistente = await getQuery(sqlSelectItem, [idCarrinho, idProdutoValidado]);

        if (itemExistente) { // se o item existir
            const novaQuantidade = itemExistente.quantidade + qtdValidada;
            // atualiza a quantidade daquele item no item
            const sqlUpdateItemCarrinho = `UPDATE itens_carrinho SET quantidade = ?, preco = ? WHERE id_item = ?`;
            await runQuery(sqlUpdateItemCarrinho, [novaQuantidade, produtoBuscado.preco, itemExistente.id_item]);
        } else {
            // se não adiciona o novo item
            const sqlAddItem = `INSERT INTO itens_carrinho (id_carrinho, id_produto, quantidade, preco)
                            VALUES (?, ?, ?, ?)`;
            await runQuery(sqlAddItem, [idCarrinho, idProdutoValidado, qtdValidada, produtoBuscado.preco]);
        }

        // retorna itens atualizados
        const itensAtualizados = await buscaItensCarrinho(idCarrinho);

        return res.status(200).json({ message: `Item ${idProdutoValidado} adicionado com sucesso.`, id_carrinho: idCarrinho, itens_carrinho: itensAtualizados });
    } catch (err) { next(err); }
};

exports.getCartById = async (req, res, next) => {
    try {
        const { id_carrinho } = req.params;

        const idCarrinho = await validaIdCarrinho(id_carrinho);
        const sqlCarrinho = `SELECT * FROM carrinhos WHERE id_carrinho = ?`;
        const carrinho = await getQuery(sqlCarrinho, [idCarrinho]);

        if (!carrinho) {
            throw new NotFoundError(`Carrinho ${id_carrinho}`);
        }

        // mostrar o que tem nos itens do carrinho
        const itensCarrinho = await buscaItensCarrinho(idCarrinho);
        carrinho.itens_carrinho = itensCarrinho;

        res.json(carrinho);
    } catch (error) {
        next(error);
    }
};

exports.updateItemQuantity = async (req, res, next) => {
    try {
        // pego o id do item
        const { id_carrinho, id_item } = req.params;
        const { id_produto, quantidade } = req.body;

        const idCarrinho = await validaIdCarrinho(id_carrinho);
        const idItemValidado = await validaIdItem(id_item);
        const idProdutoValidado = await validaIdProduto(id_produto);

        const qtdValidada = await validaEstoque(quantidade);
        if (qtdValidada < 1) {
            throw new ValidationError("quantidade", "Não pode ser 0 ou negativa.");
        }

        await verificaEstoqueProduto(idProdutoValidado, qtdValidada, idCarrinho);

        // busca preço atual do produto
        const sqlProduto = `SELECT preco FROM produtos WHERE id_produto = ?`;
        const paramProduto = idProdutoValidado;
        const produto = await getQuery(sqlProduto, paramProduto);

        const sqlUpdateItem = `UPDATE itens_carrinho SET quantidade = ?, preco = ?  WHERE id_item = ? AND id_carrinho = ?`;
        const paramsUpdateItem = [qtdValidada, produto.preco, idItemValidado, idCarrinho];
        await runQuery(sqlUpdateItem, paramsUpdateItem);

        itensAtualizados = await buscaItensCarrinho(idCarrinho);

        return res.status(200).json({
            message: `Quantidade do Produto ${idProdutoValidado} atualizada para ${qtdValidada}`,
            id_item: idItemValidado,
            id_carrinho: idCarrinho,
            id_produto: idProdutoValidado,
            itens_carrinho: itensAtualizados
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteItemCart = async (req, res, next) => {
    try {
        const { id_carrinho, id_item } = req.params;

        const idCarrinho = await validaIdCarrinho(id_carrinho);
        const idItemValidado = await validaIdItem(id_item);

        // checo se o item existe no carrinho
        const sqlBusca = `SELECT * FROM itens_carrinho WHERE id_item = ? AND id_carrinho = ?`;
        const item = await getQuery(sqlBusca, [idItemValidado, idCarrinho]);

        if (!item) {
            throw new NotFoundError(`Produto ${idProdutoValidado} não encontrado no carrinho ${idCarrinho}`);
        }

        // deleto o item
        const sqlDelete = `DELETE FROM itens_carrinho WHERE id_item = ? AND id_carrinho = ?`;
        await runQuery(sqlDelete, [idItemValidado, idCarrinho]);

        // retorno o carrinho atualizado
        const itensAtualizados = await buscaItensCarrinho(idCarrinho);

        return res.status(200).json({
            message: `Produto removido do carrinho ${idCarrinho}`,
            id_carrinho: idCarrinho,
            itens_carrinho: itensAtualizados
        });
    } catch (error) {
        next(error);
    }
};


exports.checkoutCart = async (req, res, next) => {
    try {
        const { id_carrinho } = req.params;

        const idCarrinhoValidado = await validaIdCarrinho(id_carrinho);

        const itensCarrinho = await buscaItensCarrinho(idCarrinhoValidado);

        if (!itensCarrinho || itensCarrinho.length === 0) {
            throw new ValidationError("carrinho", "Carrinho vazio, não é possível finalizar.");
        }

        // valida estoque
        for (const item of itensCarrinho) {
            await verificaEstoqueProduto(item.id_produto, item.quantidade);
        }

        // calcula total
        const total = itensCarrinho.reduce((acc, item) => {
            return acc + (item.quantidade * item.preco);
        }, 0);

        // cria pedido
        const sqlPedido = `INSERT INTO pedidos (valor_total) VALUES (?)`;
        const pedido = await runQuery(sqlPedido, [total]);
        const idPedido = pedido.lastID;

        // cria itens do pedido e baixa estoque
        for (const item of itensCarrinho) {
            await runQuery(
                `INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
                [idPedido, item.id_produto, item.quantidade, item.preco, item.quantidade * item.preco]
            );

            await runQuery(
                `UPDATE produtos SET estoque = estoque - ? WHERE id_produto = ?`,
                [item.quantidade, item.id_produto]
            );
        }

        // limpa carrinho
        await runQuery(`DELETE FROM itens_carrinho WHERE id_carrinho = ?`, [idCarrinhoValidado]);

        return res.status(201).json({
            message: "Checkout realizado com sucesso!",
            id_pedido: idPedido,
            valor_total: total,
            itens: itensCarrinho.map(i => ({
                id_produto: i.id_produto,
                quantidade: i.quantidade,
                preco_unitario: i.preco,
                subtotal: i.quantidade * i.preco
            }))
        });
    } catch (error) {
        next(error);
    }
};


