function formatarReal(valor) {
    if (valor == null || valor === "") return "";
    const numero = Number(valor);
    if (isNaN(numero)) return "";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(numero);
}

async function carregarProdutos(filtro = "") {
    try {
        // verifica se tem o query param filtro
        const url = filtro
            ? `http://127.0.0.1:3001/produtos/categorias?filtro=${encodeURIComponent(filtro)}`
            : `http://127.0.0.1:3001/produtos/categorias`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Falha ao carregar produtos");
        const categorias = await response.json();
        console.log("endpoint ", categorias);
        renderizarProdutos(categorias);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        renderizarProdutos([]);
    }
}


function renderizarProdutos(categorias) {
    // seleciona o container onde as categorias e produtos serão exibidos
    const lista = document.getElementById("listaProdutos");
    // limpa 
    lista.innerHTML = "";

    // verifica se backend retornou um array; se não, loga e sai
    if (!Array.isArray(categorias)) {
        console.error("Formato inesperado do backend:", categorias);
        return;
    }

    // Se categorias estiver vazio
    if (categorias.length === 0) {
        const vazio = document.createElement("p");
        vazio.textContent = "Nenhum produto encontrado.";
        lista.appendChild(vazio);
        return;
    }

    // Percorre cada categoria do array
    categorias.forEach(categoria => {
        // Cria uma seção para a categoria
        const section = document.createElement("section");
        section.classList.add("categoriaSection");

        const tituloCategoria = document.createElement("h3");
        tituloCategoria.textContent = categoria.nome_categoria;

        const qtdCategoria = document.createElement("h4");
        qtdCategoria.textContent = `${categoria.quantidade} ${categoria.quantidade === 1 ? "produto" : "produtos"}`;

        section.appendChild(tituloCategoria);
        section.appendChild(qtdCategoria);

        // Cria o container de cards de produtos
        const containerCards = document.createElement("div");
        containerCards.classList.add("cardsContainer");

        // Define os produtos da categoria com proteção:
        // se categoria.produtos não for um array, usa array vazio.
        const produtosDaCategoria = Array.isArray(categoria.produtos) ? categoria.produtos : [];

        // Itera pelos produtos da categoria
        produtosDaCategoria.forEach(produto => {
            // Card do produto
            const card = document.createElement("div");
            card.classList.add("card");

            // Título 
            const titulo = document.createElement("h5");
            titulo.textContent = produto.nome;

            // Descrição
            const descricao = document.createElement("p");
            descricao.classList.add("cardDescricao");
            descricao.textContent = produto.descricao;

            // Preço formatado 
            const preco = document.createElement("p");
            preco.classList.add("cardPreco");
            preco.textContent = formatarReal(produto.preco);

            // Informação de estoque
            const estoque = document.createElement("p");
            
            if (produto.estoque === 0) {
                estoque.textContent = "Sem Estoque";
                estoque.classList.add("semEstoque");
            }

            // Botão de adicionar ao carrinho
            const btnAddCarrinho = document.createElement("button");
            btnAddCarrinho.textContent = "Adicionar ao Carrinho";

            // Desabilita o botão se não há estoque
            if (produto.estoque === 0) {
                btnAddCarrinho.disabled = true; 
                btnAddCarrinho.textContent = "Indísponível";
            }

            // Handler de clique para adicionar ao carrinho
            btnAddCarrinho.addEventListener("click", async () => {
                try {
                    // Verifica se já existe um carrinho no localStorage
                    let idCarrinho = localStorage.getItem("idCarrinho");

                    // Se não existir, cria um novo carrinho no backend
                    if (!idCarrinho) {
                        const response = await fetch("http://127.0.0.1:3001/carrinho", { method: "POST" });
                        const novoCarrinho = await response.json();
                        idCarrinho = novoCarrinho.id_carrinho;
                        localStorage.setItem("idCarrinho", idCarrinho);
                    }

                    // Requisição para adicionar o item ao carrinho
                    const responseAddItemCart = await fetch(`http://127.0.0.1:3001/carrinho/${idCarrinho}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_produto: produto.id_produto, quantidade: 1 })
                    });

                    // Lê a resposta do backend 
                    const resultado = await responseAddItemCart.json();
                    console.log("Carrinho atualizado:", resultado);

                    // Feedback para o usuário
                    showAlert({ tipo: "success", mensagem: `Produto "${produto.nome}" adicionado ao carrinho!`, duracao: 2500 });
                } catch (error) {
                    // Em caso de erro, loga e informa ao usuário
                    console.error("Erro ao adicionar ao carrinho:", error);
                    showAlert({ tipo: "error", mensagem: "Não foi possível adicionar ao carrinho.", duracao: 0 });
                }
            });

            // Monta o card com os elementos
            card.appendChild(titulo);
            card.appendChild(descricao);
            card.appendChild(preco);
            card.appendChild(estoque);
            card.appendChild(btnAddCarrinho);

            // Adiciona o card ao container
            containerCards.appendChild(card);
        });

        // Adiciona o container à section
        section.appendChild(containerCards);
        // Adiciona a section à lista principal
        lista.appendChild(section);
    });
}



// chama automaticamente ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    // Ao iniciar, carrega os produtos e atualiza os cards
    carregarProdutos();

    // adiciono um filtro
    const campoBusca = document.getElementById("campoBusca");
    campoBusca.addEventListener("keydown", (evento) => {
        // se a tecla for Enter
        if (evento.key === "Enter") {
            evento.preventDefault(); // evita q ao clicar enter recarregue a página
            const termo = evento.target.value.trim();
            carregarProdutos(termo);
        }
    });
});