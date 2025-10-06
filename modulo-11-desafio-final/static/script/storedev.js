let todosProdutos = []; // variavel global pra armazenar os produtos

function formatarReal(valor) {
    if (valor == null || valor === "") return "";
    const numero = Number(valor);
    if (isNaN(numero)) return "";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(numero);
}

async function carregarProdutos() {
    try {
        const response = await fetch("http://127.0.0.1:3001/produtos");
        if (!response.ok) throw new Error("Falha ao carregar produtos");

        const produtos = await response.json();
        todosProdutos = produtos; // guarda todos os produtos

        renderizarCategorias(produtos);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        renderizarCategorias([]);
    }
}

function renderizarCategorias(produtos) {
    const lista = document.getElementById("listaProdutos");
    lista.innerHTML = "";

    // crio um objeto categorias
    const categorias = {};
    produtos.forEach(produto => {
        // Se ainda não existe uma chave para essa categoria no objeto
        if (!categorias[produto.nome_categoria]) { 
            // Cria a chave com um array vazio p por os produtos dessa categoria
            categorias[produto.nome_categoria] = []; 
        }
        categorias[produto.nome_categoria].push(produto); // joga o nome da categoria nesse array
    });

    Object.keys(categorias).forEach(nomeCategoria => {
        // pego o nome da categoria
        const produtosDaCategoria = categorias[nomeCategoria];
        // Conta quantos produtos existem nessa categoria
        const qtd = produtosDaCategoria.length;

        // Cria a section da categoria
        const section = document.createElement("section");
        section.classList.add("categoria"); // TODO - estilizar dps

        // h3 com nome da categoria
        const tituloCategoria = document.createElement("h3");
        tituloCategoria.textContent = nomeCategoria;

        // h4 com quantidade de itens
        const qtdCategoria = document.createElement("h4");
        qtdCategoria.textContent = `${qtd} ${qtd === 1 ? "produto" : "produtos"}`;

        section.appendChild(tituloCategoria);
        section.appendChild(qtdCategoria);

        // Renderizar os cards dos produtos dessa categoria
        const containerCards = document.createElement("div");
        containerCards.classList.add("cardsContainer"); // TODO  Estilizar dps

        produtosDaCategoria.forEach(produto => {
            const btnAddCarrinho = document.createElement("button");
            btnAddCarrinho.textContent = "Adicionar ao Carrinho";

            // evento de clique
            btnAddCarrinho.addEventListener("click", async () => {
                try {
                    // verifica se já existe um carrinho salvo
                    let idCarrinho = localStorage.getItem("idCarrinho");

                    if (!idCarrinho) {
                        const response = await fetch("http://127.0.0.1:3001/carrinho", {
                            method: "POST"
                        });
                        const novoCarrinho = await response.json();
                        // pega o id do carrinho criado
                        idCarrinho = novoCarrinho.id_carrinho;
                        // salva no navegador
                        localStorage.setItem("idCarrinho", idCarrinho);
                    }

                    // Faz a requisição para adicionar o produto ao carrinho existente
                    const responseAddItemCart = await fetch(`http://127.0.0.1:3001/carrinho/${idCarrinho}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" }, // informa que o corpo é JSON
                            body: JSON.stringify({
                                id_produto: produto.id_produto, // id do produto clicado
                                quantidade: 1                   // adiciona 1 unidade
                            })
                        });

                    const resultado = await responseAddItemCart.json(); // pega a resposta do backend
                    console.log("Carrinho atualizado:", resultado);
                    alert(`Produto "${produto.nome}" adicionado ao carrinho!`);

                } catch (error) {
                    console.error("Erro ao adicionar ao carrinho:", error);
                    alert("Não foi possível adicionar ao carrinho.");
                }
            })

            const card = document.createElement("div");
            card.classList.add("card"); // TODO - ESTILIZAR DPS

            const titulo = document.createElement("h5");
            titulo.textContent = produto.nome;

            const descricao = document.createElement("p");
            descricao.textContent = produto.descricao;

            const preco = document.createElement("p");
            preco.textContent = formatarReal(produto.preco);

            const estoque = document.createElement("p");
            // se o estoque == 0, ele imprime Sem Estoque
            if (produto.estoque === 0) {
                // TODO adicionar class pra deixar o texto vermelho
                estoque.textContent = "Sem Estoque";
                // desabilita o botão
                btnAddCarrinho.disabled = true;
            }

            card.appendChild(titulo);
            card.appendChild(descricao);
            card.appendChild(preco);
            card.appendChild(estoque);
            card.appendChild(btnAddCarrinho);

            containerCards.appendChild(card);
        });

        section.appendChild(containerCards);
        lista.appendChild(section);
    });
}

// chama automaticamente ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    // Ao iniciar, carrega os produtos e atualiza os cards
    carregarProdutos();

    // adiciono um filtro em tempo real
    const campoBusca = document.getElementById("campoBusca");
    campoBusca.addEventListener("input", (evento) => {
        // transforma oq vim no input em minusculo
        const termo = evento.target.value.toLowerCase();

        // filtra os produtos pelo nome
        const filtrados = todosProdutos.filter(produto =>
            // Verifica se o termo digitado está contido no nome
            // includes(): retorna true se 'termo' aparecer dentro de nome
            produto.nome.toLowerCase().includes(termo));
        // renderiza apenas os produtos filtrados
        renderizarCategorias(filtrados);
    });
});