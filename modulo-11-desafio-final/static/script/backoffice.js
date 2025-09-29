document.addEventListener("DOMContentLoaded", () => { // quando o html rodar
    // pega os links e as sections
    const links = document.querySelectorAll("nav a");
    const sections = document.querySelectorAll("section");

    links.forEach(link => { // itera sobre os links
        link.addEventListener("click", (e) => {
            e.preventDefault(); // evita pular 

            // remove active de todos os links
            links.forEach(l => l.classList.remove("active"));
            // adiciona active no link clicado
            link.classList.add("active");

            // pega o id da seção clicado, começando a partir do #
            const idSelecionado = link.getAttribute("href").substring(1);

            // esconde todas as seções
            sections.forEach(section => section.classList.remove("active"));
            // mostra só a seção clicada
            document.getElementById(idSelecionado).classList.add("active");

            if (idSelecionado === "categorias") carregarCategorias();
            if (idSelecionado === "produtos") carregarProdutos();
            if (idSelecionado === "pedidos") carregarPedidos();
        });
    });

    // já inicia mostrando categorias
    document.getElementById("categorias").classList.add("active");
    carregarCategorias();
});

async function carregarCategorias() {
    try {
        const response = await fetch("http://127.0.0.1:3001/categorias/");
        const categorias = await response.json();

        const tbody = document.querySelector("#tabelaCategorias tbody");
        tbody.innerHTML = ""; // limpa antes de renderizar

        categorias.forEach(categoria => {
            const tr = document.createElement("tr");

            // status: 1 = visível, 0 = invisível
            const statusTexto = categoria.status === 1 ? "Visível" : "Invisível";

            tr.innerHTML = `
            <td>${categoria.id_categoria}</td>
            <td>${categoria.nome}</td>
            <td>${statusTexto}</td>
            <td>
            <button>editar</button>
            </td>
        `;

            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

async function carregarProdutos() {
    try {
        const response = await fetch("http://127.0.0.1:3001/produtos/");
        const produtos = await response.json();
        console.log(produtos);

        const tbody = document.querySelector("#tabelaProdutos tbody");
        tbody.innerHTML = "";

        produtos.forEach(produto => {
            const statusTexto = produto.status === 1 ? "Ativo" : "Inativo";
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${produto.id_produto}</td>
                <td>${produto.nome}</td>
                <td>${produto.descricao}</td>
                <td>${produto.nome_categoria}</td>
                <td>R$ ${produto.preco.toFixed(2)}</td>
                <td>${produto.estoque}</td>
                <td>${statusTexto}</td>
                <td><button>editar</button></td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

async function carregarPedidos() {
    try {
        const response = await fetch("http://127.0.0.1:3001/pedidos/");
        const pedidos = await response.json();

        const tbody = document.querySelector("#tabelaPedidos tbody");
        tbody.innerHTML = "";

        pedidos.forEach(pedido => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${pedido.id_pedido}</td>
                <td>${pedido.data_criacao}</td>
                <td>${pedido.quantidade}</td>
                <td>R$ ${pedido.valor_total}</td>
                <td><button>detalhes</button></td>
            `;
            tbody.appendChild(tr);
        });


    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
    }
}