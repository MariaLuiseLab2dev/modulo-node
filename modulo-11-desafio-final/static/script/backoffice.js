// === Constantes (pega elementos do DOM) ===
// navegação
const links = document.querySelectorAll("nav a");
const sections = document.querySelectorAll("section");

// dialog de categoria
const btnNovaCategoria = document.getElementById("novaCategoria");
const dialogCategoria = document.getElementById("dialogCategoria");
const formCategoria = document.getElementById("formCategoria");
const cancelarCategoria = document.getElementById("cancelarCategoria");
const statusCheckboxCategoria = document.getElementById("statusCategoria");
const statusCategoriaLabel = document.getElementById("statusLabel");

// dialog de produto
const btnNovoProduto = document.getElementById("novoProduto");
const dialogProduto = document.getElementById("dialogProduto");
const formProduto = document.getElementById("formProduto");
const cancelarProduto = document.getElementById("cancelarProduto");
const statusProduto = document.getElementById("statusProduto");
const statusProdutoLabel = document.getElementById("statusProdutoLabel");
const selectCategoria = document.getElementById("categoriaProduto");

// pedidos
const fecharPedidoBtn = document.getElementById("fecharPedido");

// estado de edição
let editingCategoryId = null;
let editingProductId = null;

// filtros
const btnToggleFiltros = document.getElementById("btnToggleFiltros");
const filtrosDiv = document.getElementById("filtrosPedidos");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");
const inputDataInicial = document.getElementById("filtroDataInicial");
const inputDataFinal = document.getElementById("filtroDataFinal");

function formatarReal(valor) { // coloca o R$ na frente
    if (valor == null || isNaN(valor)) return ""; // verifica se o valor veio nulo
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL" // define a moeda
    }).format(valor);
}

function aplicarMascaraMoeda(input) {
    input.addEventListener("input", (evento) => {
        // tudo que n for digito (0-9), ele apaga
        let valor = evento.target.value.replace(/\D/g, "");

        if (valor === "") { // veio algum digito?
            evento.target.value = "";
            return;
        }

        // transforma em número de centavos
        let numero = parseFloat(valor) / 100;

        // formata em BRL (coloca o R$ na frente)
        evento.target.value = formatarReal(numero);
    });
}

const formatarDataHorario = (formatoIso) => {
    if (formatoIso == null || formatoIso === "") return "";

    const data = new Date(formatoIso);
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(data)
        .replace(",", "");
};

/* ===========================
   DOMContentLoaded: listeners
   =========================== */
document.addEventListener("DOMContentLoaded", () => {
    /* ---------------
        NAVEGAÇÃO 
        ---------------
    */
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            // remove active de todos os links e sections
            links.forEach(l => l.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            // ativa link e section clicados
            link.classList.add("active");
            const secaoSelecionada = link.getAttribute("href").substring(1);
            document.getElementById(secaoSelecionada).classList.add("active");

            // carrega dados da seção
            if (secaoSelecionada === "categorias") carregarCategorias();
            if (secaoSelecionada === "produtos") carregarProdutos();
            if (secaoSelecionada === "pedidos") carregarPedidos();
        });
    });

    // inicia mostrando categorias
    document.getElementById("categorias").classList.add("active");
    carregarCategorias();

    /* ---------------
        CATEGORIAS 
        ---------------
    */

    // toggle label categoria
    if (statusCheckboxCategoria) {
        statusCheckboxCategoria.addEventListener("change", () => {
            // modifica o span pra visivel e invisivel
            statusCategoriaLabel.textContent = statusCheckboxCategoria.checked ? "Visível" : "Invisível";
        });
    }

    // quando clicar no botão nova categoria
    btnNovaCategoria.addEventListener("click", () => {
        abrirDialogCategoriaCriar();
    });

    // quando clicar no botão fechar categoria
    cancelarCategoria.addEventListener("click", (evento) => {
        evento.preventDefault();
        fecharEResetarDialogCategoria();
    });

    // submit único para criar/editar categoria
    formCategoria.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const dados = {
            // 
            nome: document.getElementById("nomeCategoria").value,
            status: statusCheckboxCategoria.checked ? 1 : 0
        };

        try {
            if (!editingCategoryId) { // se o modo edição estiver como falsy/null
                // create categoria
                const response = await fetch("http://127.0.0.1:3001/categorias", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                // verifica se a response veio ok
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    showAlert({ tipo: "error", mensagem: err.error || err.message || "Erro ao atualizar categoria", duracao: 0 });
                    return;
                }

            } else { // se o modo edição estiver como true
                // update categoria
                const response = await fetch(`http://127.0.0.1:3001/categorias/${editingCategoryId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                // verifica se a response veio ok
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    showAlert({ tipo: "error", mensagem: err.error || err.message || "Erro ao atualizar categoria", duracao: 0 });
                    return;
                }
            }

            // reseta o dialog
            fecharEResetarDialogCategoria();
            // carrega as categorias na table
            await carregarCategorias();
        } catch (error) {
            console.error("Erro no submit de categoria:", error);
            showAlert({ tipo: "error", mensagem: "Erro de servidor", duracao: 3000 });

        }
    });

    // quando o checkbox do produto mudar
    if (statusProduto) {
        statusProduto.addEventListener("change", () => {
            // seta o span pra visivel e invisivel
            statusProdutoLabel.textContent = statusProduto.checked ? "Visível" : "Invisível";
        });
    }

    /* ---------------
        PRODUTOS 
        ---------------
    */

    // quando clicar no botão criar produto
    btnNovoProduto.addEventListener("click", async () => {
        // seta o modo edição como null
        editingProductId = null;
        // carrega as categorias no select
        await carregarCategoriasNoSelect();
        // seta o titulo "Novo Produto" e o botão de criar produto
        const h4 = formProduto.querySelector("h4");
        const submitBtn = formProduto.querySelector('button[type="submit"]');
        if (h4) h4.textContent = "Novo Produto";
        if (submitBtn) submitBtn.textContent = "Criar Produto";

        // mostra o dialog
        dialogProduto.show();
        const backdrop = document.querySelector("#produtos .backDark");
        if (backdrop) backdrop.style.display = "block";
    });

    // quando clicar no X
    cancelarProduto.addEventListener("click", (e) => {
        e.preventDefault();
        fecharEResetarDialogProduto(); // reseta e fecha o dialog
    });

    // pega o input do preco do produto
    const inputPreco = document.getElementById("precoProduto");

    // aplica a máscara enquanto digita
    aplicarMascaraMoeda(inputPreco);

    formProduto.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        // pra enviar ele precisa voltar a ser um float
        const inputPreco = document.getElementById("precoProduto");
        aplicarMascaraMoeda(inputPreco);

        // pega o valor formatado do input
        let precoFormatado = document.getElementById("precoProduto").value;

        // remove "R$", espaços (\s) e pontos de milhar
        precoFormatado = precoFormatado.replace(/[R$\s]/g, "").replace(/\./g, "");

        // troca vírgula por ponto
        precoFormatado = precoFormatado.replace(",", ".");

        // converte para número
        const preco = parseFloat(precoFormatado);

        const dados = {
            nome: document.getElementById("nomeProduto").value,
            descricao: document.getElementById("descricaoProduto").value,
            id_categoria: parseInt(selectCategoria.value, 10),
            preco: preco,
            estoque: parseInt(document.getElementById("estoqueProduto").value, 10),
            status: statusProduto.checked ? 1 : 0
        };

        try {
            if (!editingProductId) { // se não tiver no modo edição
                // create produto
                const response = await fetch("http://127.0.0.1:3001/produtos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });
                // verifica se a resposta veio ok
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    showAlert({ tipo: "error", mensagem: err.error || err.message || "Erro ao criar o produto.", duracao: 0 });
                    return;
                }
            } else { // se estiver 
                // update produto
                const response = await fetch(`http://127.0.0.1:3001/produtos/${editingProductId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });
                // verifica se a resposta veio ok
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    showAlert({ tipo: "error", mensagem: err.error || err.message || "Erro ao atualizar produto.", duracao: 0 });
                    return;
                }
            }

            // reseta o dialog
            fecharEResetarDialogProduto();
            // carrega os produtos na table
            await carregarProdutos();
        } catch (err) {
            console.error("Erro ao salvar produto:", err);
            showAlert({ tipo: "error", mensagem: "Erro de rede ou servidor", duracao: 0 });
        }
    });

    /* ---------------
        PEDIDOS 
        ---------------
    */

    // fechar pedido
    if (fecharPedidoBtn) {
        fecharPedidoBtn.addEventListener("click", () => {
            document.getElementById("dialogPedido").close();
            
            const backdrop = document.querySelector("#pedidos .backDark");
            if (backdrop) backdrop.style.display = "none";
        });
    }

    /* ---------------
        FILTROS 
        ---------------
    */
    // mostra e desmostra o botão e div "Filtros"
    if (btnToggleFiltros && filtrosDiv) { // se o botão e a div existirem
        btnToggleFiltros.addEventListener("click", () => { // ao clicar no botão filtros
            // se a div ta como none ou ainda não tem nenhum valor definido (ou seja, tá no estado inicial, antes de receber "block" ou "none").
            if (filtrosDiv.style.display === "none" || filtrosDiv.style.display === "") {
                filtrosDiv.style.display = "block"; // mostra a div
                btnToggleFiltros.innerHTML = '<img src="img/btnFiltros.svg"> Filtros'; // mostra o botão
            } else {
                filtrosDiv.style.display = "none"; // esconde a div
                btnToggleFiltros.innerHTML = '<img src="img/btnFiltros.svg"> Filtros'; // continue mostrando o botão
            }
        });
    }

    // pega o input valor min e max
    const inputValorMin = document.getElementById("filtroValorMin");
    const inputValorMax = document.getElementById("filtroValorMax");
    // aplica máscara de moeda nos inputs de valor enquanto digita
    aplicarMascaraMoeda(inputValorMin);
    aplicarMascaraMoeda(inputValorMax);

    // se o btnFiltras existir
    if (btnFiltrarPedidos) {
        btnFiltrarPedidos.addEventListener("click", () => { // quando dar o clique
            carregarPedidosComFiltros(); // carrega os pedidos com filtros
        });
    }

    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener("click", () => {
            document.getElementById("filtroDataInicial").value = "";
            document.getElementById("filtroDataFinal").value = "";
            document.getElementById("filtroValorMin").value = "";
            document.getElementById("filtroValorMax").value = "";

            carregarPedidos(); // volta a carregar todos os pedidos sem filtro
        });
    }
});

/* ===========================
   Funções auxiliares
   =========================== */

async function carregarCategorias() {
    try {
        // chama o endpoint get categorias
        const response = await fetch("http://127.0.0.1:3001/categorias/");
        const categorias = await response.json();

        // pega o body da tabela
        const tbody = document.querySelector("#tabelaCategorias tbody");
        tbody.innerHTML = ""; // limpa

        // para cada categoria
        categorias.forEach(categoria => {
            // seta o status e a classe css pra pintar
            const statusTexto = categoria.status === 1 ? "Visível" : "Invisível";
            const statusClasse = categoria.status === 1 ? "statusVis" : "statusInv";

            // cria o tr
            const tr = document.createElement("tr");
            // adiciona as colunas com as info.
            tr.innerHTML = `
                <td>${categoria.id_categoria}</td>
                <td>${categoria.nome}</td>
                <td><span class="${statusClasse}">${statusTexto}</span></td>
                <td>
                <button type="button" class="editarCategoria btnEditar" data-id="${categoria.id_categoria}"><img src="img/btnEditar.svg"></button>
                </td>
                `;
            // joga a linha dentro do body  
            tbody.appendChild(tr);
        });

        // adiciona evento nos botões editar (após renderizar)
        document.querySelectorAll(".editarCategoria").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                abrirDialogCategoriaEditar(id);
            });
        });
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

function abrirDialogCategoriaCriar() {
    // seta o modo edição como nulo
    editingCategoryId = null;
    //cria o h4
    const h4 = formCategoria.querySelector("h4");
    //cria o botão pra enviar  
    const submitBtn = formCategoria.querySelector('button[type="submit"]');
    // define os nomes do titulo e do botão
    if (h4) h4.textContent = "Nova Categoria";
    if (submitBtn) submitBtn.textContent = "Criar Categoria";
    // reseta o fom categoria
    formCategoria.reset();
    // se status existir
    if (statusCheckboxCategoria) {
        // seta check como true
        statusCheckboxCategoria.checked = true;
        // seta a span como Visível  
        statusCategoriaLabel.textContent = "Visível";
    }
    // mostra o dialog
    dialogCategoria.show();

    const backdrop = document.querySelector("#categorias .backDark");
    if (backdrop) backdrop.style.display = "block";
}

async function abrirDialogCategoriaEditar(id) {
    try {
        // busca o endpoint pra editar
        const response = await fetch(`http://127.0.0.1:3001/categorias/${id}`);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            showAlert({ tipo: "error", mensagem: err.error || err.message || "Categoria não encontrada", duracao: 0 });
            return;
        }
        const categoria = await response.json();

        // preencher form
        document.getElementById("nomeCategoria").value = categoria.nome; // busca o nome da categoria
        if (statusCheckboxCategoria) {
            // seta o status como checked
            statusCheckboxCategoria.checked = categoria.status === 1;
            // seta o nome da span
            statusCategoriaLabel.textContent = statusCheckboxCategoria.checked ? "Visível" : "Invisível";
        }

        // modo edição
        editingCategoryId = id;
        const h4 = formCategoria.querySelector("h4");
        const submitBtn = formCategoria.querySelector('button[type="submit"]');
        if (h4) h4.textContent = "Editar Categoria";
        if (submitBtn) submitBtn.textContent = "Salvar Alterações";

        dialogCategoria.show();
        const backdrop = document.querySelector("#categorias .backDark");
        if (backdrop) backdrop.style.display = "block";

    } catch (error) {
        console.error("Erro ao abrir dialog de editar categoria:", error);
        showAlert({ tipo: "error", mensagem: "Erro ao carregar categoria", duracao: 0 });
    }
}

function fecharEResetarDialogCategoria() {
    // fecha o dialog
    dialogCategoria.close();

    const backdrop = document.querySelector("#categorias .backDark");
    if (backdrop) backdrop.style.display = "none";

    // reseta o form
    formCategoria.reset();
    // define o modo de edição como nulo
    editingCategoryId = null;
    // seta o checkbox como true
    if (statusCheckboxCategoria) {
        statusCheckboxCategoria.checked = true;
        statusCategoriaLabel.textContent = "Visível";
    }
    // restaura textos pra criação
    const h4 = formCategoria.querySelector("h4");
    const submitBtn = formCategoria.querySelector('button[type="submit"]');
    if (h4) h4.textContent = "Nova Categoria";
    if (submitBtn) submitBtn.textContent = "Criar Categoria";
    
}

/* ---------------------------
   Produtos
   --------------------------- */
async function carregarProdutos() {
    try {
        const response = await fetch("http://127.0.0.1:3001/produtos/");
        const produtos = await response.json();

        const tbody = document.querySelector("#tabelaProdutos tbody");
        tbody.innerHTML = "";

        produtos.forEach(produto => {
            const statusTexto = produto.status === 1 ? "Visível" : "Invisível";
            const statusClasse = produto.status === 1 ? "statusVis" : "statusInv";

            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${produto.id_produto}</td>
            <td>${produto.nome}</td>
            <td>${produto.descricao}</td>
            <td>${produto.nome_categoria}</td>
            <td>${formatarReal(produto.preco)}</td>
            <td>${produto.estoque}</td>
            <td><span class="${statusClasse}">${statusTexto}</span></td>
            <td><button class="editarProduto btnEditar" data-id="${produto.id_produto}"><img src="img/btnEditar.svg"></button></td>
        `;
            tbody.appendChild(tr);
        });

        // listeners nos editar produto
        document.querySelectorAll(".editarProduto").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                editaProduto(id);
            });
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

async function editaProduto(id) {
    try {
        const res = await fetch(`http://127.0.0.1:3001/produtos/${id}`);
        if (!res.ok) throw new Error("Produto não encontrado");
        const produto = await res.json();

        // joga as categorias como opções do select
        await carregarCategoriasNoSelect();

        // preenche campos
        document.getElementById("nomeProduto").value = produto.nome;
        document.getElementById("descricaoProduto").value = produto.descricao;
        document.getElementById("precoProduto").value = produto.preco;
        document.getElementById("estoqueProduto").value = produto.estoque;
        if (produto.id_categoria != null) selectCategoria.value = String(produto.id_categoria);
        statusProduto.checked = produto.status === 1;
        statusProdutoLabel.textContent = statusProduto.checked ? "Visível" : "Invisível";

        // set estado de edição e mostra dialog
        editingProductId = id;
        const h4 = formProduto.querySelector("h4");
        const submitBtn = formProduto.querySelector('button[type="submit"]');
        if (h4) h4.textContent = "Editar Produto";
        if (submitBtn) submitBtn.textContent = "Salvar Alterações";

        dialogProduto.show();
        const backdrop = document.querySelector("#produtos .backDark");
        if (backdrop) backdrop.style.display = "block";
    } catch (err) {
        console.error("Erro ao carregar produto para edição:", err);
        showAlert({ tipo: "error", mensagem: "Erro ao atualizar o produto", duracao: 0 });
    }
}

function fecharEResetarDialogProduto() {
    dialogProduto.close(); // fecha o dialog

    const backdrop = document.querySelector("#produtos .backDark");
    if (backdrop) backdrop.style.display = "none";
    
    editingProductId = null;
    formProduto.reset();
    statusProduto.checked = true;
    statusProdutoLabel.textContent = "Visível";
    const h4 = formProduto.querySelector("h4");
    const submitBtn = formProduto.querySelector('button[type="submit"]');
    if (h4) h4.textContent = "Novo Produto";
    if (submitBtn) submitBtn.textContent = "Criar Produto";
}

/* ---------------------------
   Pedidos
   --------------------------- */
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
            <td>${String(formatarDataHorario(pedido.data_criacao))}</td>
            <td>${pedido.quantidade}</td>
            <td>${formatarReal(pedido.valor_total)}</td>
            <td><button class="detalhes btnDetalhes" data-id="${pedido.id_pedido}"><img src="img/btnDetalhes.svg"></button></td>
        `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll(".detalhes").forEach(btnDetalhes => {
            btnDetalhes.addEventListener("click", () => {
                const id = btnDetalhes.dataset.id;
                carregarPedidoPorId(id);
            });
        });
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
    }
}

async function carregarPedidoPorId(id) {
    try {
        const response = await fetch(`http://127.0.0.1:3001/pedidos/${id}`);
        const pedido = await response.json();

        document.getElementById("pedidoId").textContent = pedido.id_pedido;
        document.getElementById("pedidoData").textContent = formatarDataHorario(pedido.data_criacao).split(" ")[0];
        document.getElementById("pedidoValor").textContent = formatarReal(pedido.valor_total);

        let quantidadeTotal = 0;

        // se existir um array de itens
        if (pedido.itens && Array.isArray(pedido.itens)) {
            // pra cada item dentro de itens
            for (let item of pedido.itens) {
                // soma cada quantidade, garantindo que é número
                quantidadeTotal += Number(item.quantidade) || 0;
            }
        } else {
            quantidadeTotal = 0; // valor padrão
        }
        document.getElementById("pedidoQtde").textContent = quantidadeTotal;

        const tbody = document.getElementById("pedidoItens");
        tbody.innerHTML = "";
        (pedido.itens || []).forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${item.nome_produto}</td>
            <td>${item.descricao}</td>
            <td>${item.quantidade}</td>
            <td>${formatarReal(item.preco_unitario)}</td>
            <td>${formatarReal(item.subtotal)}</td>
        `;
            tbody.appendChild(tr);
        });

        document.getElementById("dialogPedido").show();
        const backdrop = document.querySelector("#pedidos .backDark");
        if (backdrop) backdrop.style.display = "block";

    } catch (error) {
        console.error("Erro ao carregar pedido por id:", error);
    }
}

/* ---------------------------
   Helpers 
   --------------------------- */
async function carregarCategoriasNoSelect() {
    try {
        const response = await fetch("http://127.0.0.1:3001/categorias/");
        const categorias = await response.json();

        const select = selectCategoria;
        select.innerHTML = ""; // limpa

        categorias.forEach(categoria => {
            // cria option
            const option = document.createElement("option");
            // valor dele e o id
            option.value = categoria.id_categoria;
            // no html aparece o nome dele
            option.textContent = categoria.nome;
            // coloca o option dentro do select
            select.appendChild(option);
        });

        return categorias;
    } catch (error) {
        console.error("Erro ao carregar categorias no select:", error);
        return [];
    }
}

async function carregarPedidosComFiltros() {
    // Captura os valores digitados nos inputs de filtro
    const dataInicial = document.getElementById("filtroDataInicial").value;
    const dataFinal = document.getElementById("filtroDataFinal").value;

    // Captura os valores dos inputs de moeda e converte para número
    const valorMin = document.getElementById("filtroValorMin").value
        .replace(/[R$\s.]/g, "") // remove R$, espaços e pontos
        .replace(",", ".");      // troca vírgula por ponto

    const valorMax = document.getElementById("filtroValorMax").value
        .replace(/[R$\s.]/g, "")
        .replace(",", ".");

    // Cria um objeto para montar a query string da URL
    const params = new URLSearchParams();

    // Adiciona os filtros à URL apenas se estiverem preenchidos
    if (dataInicial) params.append("dataInicial", dataInicial);
    if (dataFinal) params.append("dataFinal", dataFinal);
    if (valorMin) params.append("valorMin", valorMin);
    if (valorMax) params.append("valorMax", valorMax);

    try {
        // Faz a requisição GET para o back-end com os filtros aplicados
        const response = await fetch(`http://127.0.0.1:3001/pedidos?${params.toString()}`);

        // Se a resposta não for OK (status 200), lança erro
        if (!response.ok) throw new Error("Erro ao buscar pedidos");

        // Converte a resposta da API para JSON (lista de pedidos)
        const pedidos = await response.json();

        // Seleciona o corpo da tabela de pedidos e limpa o conteúdo anterior
        const tbody = document.querySelector("#tabelaPedidos tbody");
        tbody.innerHTML = "";

        // Para cada pedido recebido, cria uma linha na tabela
        pedidos.forEach(pedido => {
            const tr = document.createElement("tr");

            // Preenche a linha com os dados do pedido
            tr.innerHTML = `
                <td>${pedido.id_pedido}</td>
                <td>${formatarDataHorario(pedido.data_criacao)}</td>
                <td>${pedido.quantidade}</td>
                <td>${formatarReal(pedido.valor_total)}</td>
                <td><button class="detalhes btnDetalhes" data-id="${pedido.id_pedido}"><img src="img/btnDetalhes.svg"></button></td>
            `;

            // Adiciona a linha à tabela
            tbody.appendChild(tr);
        });

        // coloca de novo os eventos de clique nos botões "detalhes" recém-criados
        document.querySelectorAll(".detalhes").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id; // pega o id do pedido
                carregarPedidoPorId(id);   // chama a função que abre o dialog com os detalhes
            });
        });

    } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
    }
}
