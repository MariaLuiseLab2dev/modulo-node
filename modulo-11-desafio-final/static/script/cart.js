function formatarReal(valor) {
    if (valor == null || valor === "") return "";
    const numero = Number(valor);
    if (isNaN(numero)) return "";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(numero);
}

async function carregarCarrinho() {
    // Pegando o id do carrinho salvo no navegador (localStorage)
    const idCarrinho = localStorage.getItem("idCarrinho");

    // Se não existir carrinho salvo, mostra mensagem e encerra
    if (!idCarrinho) {
        alert("Seu carrinho está vazio.");
        return;
    }

    // Faz requisição GET para buscar o carrinho no backend
    const resp = await fetch(`http://127.0.0.1:3001/carrinho/${idCarrinho}`);
    const carrinho = await resp.json(); // transforma a resposta em JSON

    // Pega a div onde os itens vão ser renderizado
    const container = document.getElementById("itensCarrinho");
    container.innerHTML = ""; // limpa conteúdo anterior

    let total = 0;     // variável para somar o valor total
    let qtdItens = 0;  // variável para contar a quantidade de itens

    // Para cada item da lista itens_carrinho
    carrinho.itens_carrinho.forEach(item => {
        const div = document.createElement("div"); // cria uma div para o item
        div.classList.add("itemCarrinho");         // TODO Estilizar classe CSS

        // Mostra nome, preço e descricao do produto
        const nome = document.createElement("p");
        nome.textContent = `${item.nome}`;

        const preco = document.createElement("p");
        preco.textContent = formatarReal(item.preco);

        const descricao = document.createElement("p");
        descricao.textContent = `${item.descricao}`;

        // Cria um <select> para escolher a quantidade
        const selectQtd = document.createElement("select");
        for (let i = 1; i <= item.estoque; i++) {   // opções de 1 até o estoque disponível
            const opt = document.createElement("option"); //crio um option
            opt.value = i; // coloco o valor dele o número
            opt.textContent = i; // imprimo o valor dele tbm 
            if (i === item.quantidade) opt.selected = true; // seleciona a quantidade atual
            selectQtd.appendChild(opt);
        }

        // Evento quando o usuário muda a quantidade no select
        selectQtd.addEventListener("change", async () => {
            await fetch(`http://127.0.0.1:3001/carrinho/${idCarrinho}/item/${item.id_item}`, {
                method: "PATCH", // atualiza quantidade
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_produto: item.id_produto,
                    quantidade: Number(selectQtd.value)
                })
            });
            carregarCarrinho(); // recarrega carrinho atualizado
        });

        // Cria botão de remover item
        const btnDeletar = document.createElement("button");
        btnDeletar.innerHTML = '<img src="img/btnDeletar.svg">';
        btnDeletar.addEventListener("click", async () => {
            await fetch(`http://127.0.0.1:3001/carrinho/${idCarrinho}/item/${item.id_item}`, {
                method: "DELETE" // remove item do carrinho
            });
            carregarCarrinho(); // recarrega carrinho atualizado
        });

        // Monta a div do item com nome, select e botão
        div.appendChild(nome);
        div.appendChild(preco);
        div.appendChild(descricao);
        div.appendChild(selectQtd);
        div.appendChild(btnDeletar);
        container.appendChild(div);

        // Atualiza total e quantidade de itens
        total += item.preco * item.quantidade;
        qtdItens += item.quantidade;
    });

    // Atualiza cabeçalho com quantidade de itens
    document.getElementById("qtdCarrinho").textContent =
        `${qtdItens} ${qtdItens === 1 ? "item" : "itens"}`;

    // Atualiza total 
    document.getElementById("totalCarrinho").textContent =
        `Total: ${formatarReal(total)}`;
}

// Quando a página carregar, executa o código
document.addEventListener("DOMContentLoaded", () => {
    carregarCarrinho(); // carrega carrinho automaticamente

    // Botão de checkout (finalizar pedido)
    document.getElementById("btnCheckout").addEventListener("click", async () => {
        const idCarrinho = localStorage.getItem("idCarrinho"); // pega o id do carrinho
        // manda pro endpoint do back
        const resp = await fetch(`http://127.0.0.1:3001/carrinho/checkout/${idCarrinho}`, {
            method: "POST" // finaliza o pedido
        });
        const resultado = await resp.json();
        alert(resultado.message); // mostra mensagem de sucesso
        localStorage.removeItem("idCarrinho"); // limpa carrinho salvo
        window.location.href = "storedev.html";   // redireciona para a loja
    });
});

document.addEventListener("DOMContentLoaded", carregarModal);