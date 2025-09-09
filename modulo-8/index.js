const { runQuery, allQuery } = require('./my-helper.js');
const prompt = require('prompt');

async function inserirProduto(name, price) {
    const sqlInsert = `INSERT INTO products (name, price) VALUES (?,?)`;
    const params = [name, price];
    try {
        const product = await runQuery(sqlInsert, params);
        console.log(product);
    } catch (error) {
        console.error('Falha ao inserir um produto:', error);
    }
}

async function listarProdutos() {
    const sqlSelect = `SELECT * FROM products`;
    try {
        const products = await allQuery(sqlSelect);
        products.forEach(product => {
            console.log(` -------------\nID do Produto: ${product.id} \nProduto: ${product.name} \nR$${product.price}\n`);
        });
    }
    catch (error) {
        console.error("Falha ao listar os produtos: ", error);
    }
}


// CRIAR PEDIDOS
async function criarPedido(quantity, createdAt, prodId) {

    const sqlInsert = `INSERT INTO orders (quantity, created_at, prod_id) VALUES (?,?, ?)`;
    const params = [quantity, createdAt, prodId];
    
    try {
        const order = await runQuery(sqlInsert, params);
        console.log(order);
    } 
    catch (error) {
        console.log("Falha ao inserir um pedido: ", error);
    }
}


// (realizando um JOIN com a tabela de produtos para exibir também o nome do produto associado)
async function listarPedidos() {
    const sqlSelect = `SELECT
                            orders.id,
                            orders.quantity,
                            orders.created_at,
                            orders.prod_id,
                            products.name
                        FROM
                            orders 
                            LEFT JOIN
                            products
                        ON products.id = orders.prod_id;`;
     try {
        const orders = await allQuery(sqlSelect);
        orders.forEach(order => {
            console.log(`--------\nPedido: ${order.id}\nQuantidade: ${order.quantity}\nCriado em: ${order.created_at}\nID do produto: ${order.prod_id}\nNome do Produto: ${order.name}`);
        });
    }
    catch (error) {
        console.error("Falha ao listar os produtos: ", error);
    }
}

// ATUALIZAR A QUANTIDADE DE UM PEDIDO JÁ CADASTRADO
async function atualizarQuantidade(quantity, id) {
    if(quantity <= 0) { console.log("Quantidade deve ser maior que zero."); return;}

    const sqlUpdate = `UPDATE orders SET quantity = ? WHERE id = ?`;
    const params = [quantity, id];

    try {
        const newQuantity = await runQuery(sqlUpdate, params);
        if (newQuantity.changes > 0) {
            console.log(`Quantidade do pedido ${id} atualizada! para ${quantity} com sucesso!`);
        } else {
            console.log("Nenhum pedido encontrado para esse ID.");
        }
    } catch (error) {
        console.error("Erro ao atualizar a quantidade do pedido: ", error);
    }
}

// EXCLUIR OS PEDIDOS PELO IDENTIFICADOR
async function deletarPedido(id) {
    // listar pedidos
    console.log("PEDIDOS DISPONVEIS: \n");
    await listarPedidos();
    const sqlDelete = `DELETE FROM orders WHERE id = ?;`;
    const params = id;
    try {
        const deletedOrder= await runQuery(sqlDelete, params);
        if(deletedOrder.changes == 0) {
            console.log(`\nNenhum pedido encontrado para esse ID: ${id}.\n`);
        } else {
            console.log("Pedido deletado!");
        }
    }
    catch (error) {
        console.error("Erro ao deletar pedido: ", error);
    }  
}

async function perguntaUsuario() {
    prompt.start();

    let continuar = true;

    while (continuar) {
        // mostra o menu principal
        const { opcao } = await prompt.get([{
            name: "opcao",
            description: "\nEscolha uma opção\n1 - Criar pedido\n2 - Listar pedidos\n3 - Atualizar quantidade\n4 - Deletar pedido\n5 - Adicionar um produto\n6 - Listar Produtos\n0 - Sair\n",
            required: true
        }]);

        switch(Number(opcao)) {
            case 1: { // criar pedido
                // mostrar os pedidos disponiveis
                console.log("\nPRODUTOS DISPONÍVEIS:");
                await listarProdutos();
                const { quantity, createdAt, prodId } = await prompt.get([
                    { 
                        name: "quantity", 
                        description: "Quantidade", 
                        required: true, 
                        pattern: /^[1-9]\d*$/, 
                        message: "Digite um número maior que 0."
                    },
                    {
                        name: "createdAt", 
                        description: "Data (YYYY-MM-DD)", 
                        required: true, 
                        pattern: /^(19\d{2}|20[0-1]\d|202[0-5])-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 
                        message: "Data inválida. Use o formato YYYY-MM-DD com ano até 2025."  },
                    { 
                        name: "prodId", 
                        description: "ID do produto", 
                        required: true,
                        pattern: /^[1-9]\d*$/, 
                        message: "Digite um número maior que 0."
                    }
                ]);
                await criarPedido(Number(quantity), createdAt, Number(prodId));
                break;
            }
            case 2: { // listar pedidos
                await listarPedidos();
                break;
            }
            case 3: { // atualizar pedido
                // mostrar os pedidos disponiveis
                console.log("\nPRODUTOS DISPONÍVEIS:");
                await listarProdutos();

                console.log("\n PEDIDOS:");
                await listarPedidos();
                const { id, quantity } = await prompt.get([
                    { 
                        name: "id", 
                        description: "ID do pedido", 
                        required: true,
                        pattern: /^[1-9]\d*$/, 
                        message: "Digite um número maior que 0." 
                    },
                    { 
                        name: "quantity", 
                        description: "Nova quantidade", 
                        required: true,
                        pattern: /^[1-9]\d*$/, 
                        message: "Digite um número maior que 0."
                    }
                ]);
                await atualizarQuantidade(Number(quantity), Number(id));
                break;
            }
            case 4: { // deletar pedido
                // mostrar os pedidos disponiveis
                console.log("\nPRODUTOS DISPONÍVEIS:");
                await listarProdutos();
                const { id } = await prompt.get([
                    { 
                        name: "id", 
                        description: "ID do pedido", required: true,
                        pattern: /^[1-9]\d*$/, 
                        message: "Digite um número maior que 0."
                     }
                ]);
                await deletarPedido(Number(id));
                break;
            }
            case 5: {
                const { name, price } = await prompt.get([
                    { 
                        name: "name", 
                        description: "Insira o nome do produto", 
                        required: true,
                        pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ ]+[0-9'\-\.,()]*$/,
                        message: "Digite apenas produtos válidos. (Ex: fanta 200ml e não 9)"
                    },
                    { 
                        name: "price", 
                        description: "Insira o preço do produto", 
                        required:true,
                        pattern: /^\d+(\.\d{1,2})?$/,
                        message: "Digite aepnas valores válidos. (ex: 99.99)"
                    },
                ])
                await inserirProduto(name, parseFloat(price));
                break;
            }
            case 6: {
                await listarProdutos();
                break;
            }
            case 0: { // sair
                console.log("Encerrando o programa...");
                continuar = false;
                break;
            }
            default:
                console.log("Opção inválida. Tente novamente.");
        }
    }
}

perguntaUsuario();