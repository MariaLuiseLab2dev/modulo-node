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

function formatarReal(valor) {
    if (valor == null || isNaN(valor)) return "";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valor);
}

function aplicarMascaraMoeda(input) {
    input.addEventListener("input", (e) => {
        // pega só os dígitos
        let valor = e.target.value.replace(/\D/g, "");

        if (valor === "") {
            e.target.value = "";
            return;
        }

        // transforma em número de centavos
        let numero = parseFloat(valor) / 100;

        // formata em BRL
        e.target.value = numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    });
}


/* ===========================
   DOMContentLoaded: listeners
   =========================== */
document.addEventListener("DOMContentLoaded", () => {
    // navegação
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            // remove active de todos os links e sections
            links.forEach(l => l.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            // ativa link e section clicados
            link.classList.add("active");
            const idSelecionado = link.getAttribute("href").substring(1);
            document.getElementById(idSelecionado).classList.add("active");

            // carrega dados da seção
            if (idSelecionado === "categorias") carregarCategorias();
            if (idSelecionado === "produtos") carregarProdutos();
            if (idSelecionado === "pedidos") carregarPedidos();
        });
    });

    // inicia mostrando categorias
    document.getElementById("categorias").classList.add("active");
    carregarCategorias();

    // toggle label categoria
    if (statusCheckboxCategoria) {
        statusCheckboxCategoria.addEventListener("change", () => {
            statusCategoriaLabel.textContent = statusCheckboxCategoria.checked ? "Visível" : "Invisível";
        });
    }

    // abrir novo (categoria) - modo criar
    btnNovaCategoria.addEventListener("click", () => {
        abrirDialogCategoriaCriar();
    });

    // cancelar categoria
    cancelarCategoria.addEventListener("click", (e) => {
        e.preventDefault();
        fecharEResetarDialogCategoria();
    });

    // submit único para criar/editar categoria
    formCategoria.addEventListener("submit", async (e) => {
        e.preventDefault();
        const dados = {
            nome: document.getElementById("nomeCategoria").value,
            status: statusCheckboxCategoria.checked ? 1 : 0
        };

        try {
            if (!editingCategoryId) {
                // create
                const response = await fetch("http://127.0.0.1:3001/categorias", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    alert(err.error || err.message || "Erro ao criar categoria");
                    return;
                }
                
            } else {
                // update
                const response = await fetch(`http://127.0.0.1:3001/categorias/${editingCategoryId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    alert(err.error || err.message || "Erro ao atualizar categoria");
                    return;
                }
            }

            fecharEResetarDialogCategoria();
            await carregarCategorias();
        } catch (error) {
            console.error("Erro no submit de categoria:", error);
            alert("Erro de rede ou servidor");
        }
    });

    // product toggles / open dialog
    if (statusProduto) {
        statusProduto.addEventListener("change", () => {
            statusProdutoLabel.textContent = statusProduto.checked ? "Visível" : "Invisível";
        });
    }

    btnNovoProduto.addEventListener("click", async () => {
        editingProductId = null;
        await carregarCategoriasNoSelect();
        // tenta setar título do form se houver <h4>, senão não faz nada
        const h4 = formProduto.querySelector("h4");
        const submitBtn = formProduto.querySelector('button[type="submit"]');
        if (h4) h4.textContent = "Novo Produto";
        if (submitBtn) submitBtn.textContent = "Criar Produto";

        dialogProduto.showModal();
    });

    cancelarProduto.addEventListener("click", (e) => {
        e.preventDefault();
        dialogProduto.close();
        resetarDialogProduto();
    });
    
    const inputPreco = document.getElementById("precoProduto");
    aplicarMascaraMoeda(inputPreco);

    formProduto.addEventListener("submit", async (e) => {
        e.preventDefault();

        const inputPreco = document.getElementById("precoProduto");
        aplicarMascaraMoeda(inputPreco);

        // pega o valor formatado do input
        let precoFormatado = document.getElementById("precoProduto").value;

        // remove "R$", espaços e pontos de milhar
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
            if (!editingProductId) {
                // create product
                const response = await fetch("http://127.0.0.1:3001/produtos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    alert(err.error || err.message || "Erro ao criar produto");
                    return;
                }
            } else {
                // update product
                const response = await fetch(`http://127.0.0.1:3001/produtos/${editingProductId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    alert(err.error || err.message || "Erro ao atualizar produto");
                    return;
                }
            }

            dialogProduto.close();
            resetarDialogProduto();
            await carregarProdutos();
        } catch (err) {
            console.error("Erro ao salvar produto:", err);
            alert("Erro de rede ou servidor");
        }
    });

    // fechar pedido
    if (fecharPedidoBtn) {
        fecharPedidoBtn.addEventListener("click", () => {
            document.getElementById("dialogPedido").close();
        });
    }

    if (btnToggleFiltros && filtrosDiv) {
        btnToggleFiltros.addEventListener("click", () => {
            if (filtrosDiv.style.display === "none" || filtrosDiv.style.display === "") {
                filtrosDiv.style.display = "block";
                btnToggleFiltros.textContent = "Esconder filtros";
            } else {
                filtrosDiv.style.display = "none";
                btnToggleFiltros.textContent = "Filtros";
            }
        });
    }

    // enquanto digita
    const inputValorMin = document.getElementById("filtroValorMin");
    const inputValorMax = document.getElementById("filtroValorMax");
    // aplica máscara de moeda nos inputs de valor
    aplicarMascaraMoeda(inputValorMin);
    aplicarMascaraMoeda(inputValorMax);

    if (btnFiltrarPedidos) {
        btnFiltrarPedidos.addEventListener("click", () => {
            carregarPedidosComFiltros(); // sua função que monta a URL com query params
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
        const response = await fetch("http://127.0.0.1:3001/categorias/");
        const categorias = await response.json();

        const tbody = document.querySelector("#tabelaCategorias tbody");
        tbody.innerHTML = ""; // limpa

        categorias.forEach(categoria => {
            const statusTexto = categoria.status === 1 ? "Visível" : "Invisível";
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${categoria.id_categoria}</td>
        <td>${categoria.nome}</td>
        <td>${statusTexto}</td>
        <td>
          <button class="editarCategoria" data-id="${categoria.id_categoria}">editar</button>
        </td>
      `;
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
    editingCategoryId = null;
    // atualiza título e texto do submit se existir
    const h4 = formCategoria.querySelector("h4");
    const submitBtn = formCategoria.querySelector('button[type="submit"]');
    if (h4) h4.textContent = "Nova Categoria";
    if (submitBtn) submitBtn.textContent = "Criar Categoria";

    formCategoria.reset();
    if (statusCheckboxCategoria) {
        statusCheckboxCategoria.checked = true;
        statusCategoriaLabel.textContent = "Visível";
    }
    dialogCategoria.showModal();
}

async function abrirDialogCategoriaEditar(id) {
    try {
        const response = await fetch(`http://127.0.0.1:3001/categorias/${id}`);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            alert(err.error || err.message || "Categoria não encontrada");
            return;
        }
        const categoria = await response.json();

        // preencher form
        document.getElementById("nomeCategoria").value = categoria.nome || "";
        if (statusCheckboxCategoria) {
            statusCheckboxCategoria.checked = categoria.status === 1;
            statusCategoriaLabel.textContent = statusCheckboxCategoria.checked ? "Visível" : "Invisível";
        }

        // modo edição
        editingCategoryId = id;
        const h4 = formCategoria.querySelector("h4");
        const submitBtn = formCategoria.querySelector('button[type="submit"]');
        if (h4) h4.textContent = "Editar Categoria";
        if (submitBtn) submitBtn.textContent = "Salvar Alterações";

        dialogCategoria.showModal();
    } catch (error) {
        console.error("Erro ao abrir dialog de editar categoria:", error);
        alert("Erro ao carregar categoria");
    }
}

function fecharEResetarDialogCategoria() {
    dialogCategoria.close();
    formCategoria.reset();
    editingCategoryId = null;
    if (statusCheckboxCategoria) {
        statusCheckboxCategoria.checked = true;
        statusCategoriaLabel.textContent = "Visível";
    }
    // restaura textos
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
            const statusTexto = produto.status === 1 ? "Ativo" : "Inativo";
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${produto.id_produto}</td>
        <td>${produto.nome}</td>
        <td>${produto.descricao}</td>
        <td>${produto.nome_categoria}</td>
        <td>${formatarReal(produto.preco)}</td>
        <td>${produto.estoque}</td>
        <td>${statusTexto}</td>
        <td><button class="editarProduto" data-id="${produto.id_produto}">editar</button></td>
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

        // garante opções do select
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

        dialogProduto.showModal();
    } catch (err) {
        console.error("Erro ao carregar produto para edição:", err);
        alert(err.message || "Erro ao carregar produto");
    }
}

function resetarDialogProduto() {
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
            <td>${pedido.data_criacao}</td>
            <td>${pedido.quantidade}</td>
            <td>${formatarReal(pedido.valor_total)}</td>
            <td><button class="detalhes" data-id="${pedido.id_pedido}">detalhes</button></td>
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
        document.getElementById("pedidoData").textContent = pedido.data_criacao;
        document.getElementById("pedidoValor").textContent = formatarReal(pedido.valor_total);

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

        document.getElementById("dialogPedido").showModal();
    } catch (error) {
        console.error("Erro ao carregar pedido por id:", error);
    }
}

/* ---------------------------
   Helpers (select de categorias)
   --------------------------- */
async function carregarCategoriasNoSelect() {
    try {
        const response = await fetch("http://127.0.0.1:3001/categorias/");
        const categorias = await response.json();

        const select = selectCategoria;
        select.innerHTML = ""; // limpa

        categorias.forEach(categoria => {
            const option = document.createElement("option");
            option.value = categoria.id_categoria;
            option.textContent = categoria.nome;
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
                <td>${new Date(pedido.data_criacao).toLocaleString("pt-BR")}</td>
                <td>${pedido.quantidade}</td>
                <td>${formatarReal(pedido.valor_total)}</td>
                <td><button class="detalhes" data-id="${pedido.id_pedido}">detalhes</button></td>
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