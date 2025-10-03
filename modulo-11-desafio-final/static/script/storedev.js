async function carregarProdutos() {
    try {
        // Faz a requisição para o endpoint que você implementou (GET /produtos)
        const resp = await fetch("http://127.0.0.1:3001/produtos");
        // Se a resposta não for OK, lança erro para cair no catch
        if (!resp.ok) throw new Error("Falha ao carregar produtos");
        // Converte o corpo da resposta em JSON (array de produtos)
        const produtos = await resp.json();
        console.log(produtos);
        // Atualiza a UI com os produtos recebidos
        // renderizarProdutos(produtos);
    } catch (err) {
        // Em caso de erro, loga no console para depuração
        console.error("Erro ao carregar produtos:", err);
        // E mostra uma mensagem de falha na UI
        // renderizarProdutos([]);
    }
}

// async function renderizarProdutos () { 

// }

// chama automaticamente ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    // Ao iniciar, carrega os produtos e atualiza os cards
    carregarProdutos();
});