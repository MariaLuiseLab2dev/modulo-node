const form = document.querySelector(".form");

async function loadProducts() {
    try {
        const res = await axios.get('/products'); // chama a rota que retorna JSON
        console.log(res);
        if (res.status !== 200) {
            throw new Error('Erro na requisição: ' + res.status + ' - ' + res.message);
        }
        console.log(res.data);
        const products = res.data; // espera a lista de produtos vim
        
        const ul = document.getElementById('product-list');
        ul.innerHTML = '';

        // percorre o array que veio da rota products index.html
        products.forEach(p => {
            const li = document.createElement('li'); // crio o item da lista
            li.classList.add('product-item'); // estilizo

            const nameSpan = document.createElement('span'); // crio o span do name
            nameSpan.classList.add('product-name'); // estilizo
            nameSpan.textContent = p.product; // jogo o conteudo de product la dentro

            const qtySpan = document.createElement('span');
            qtySpan.classList.add('product-quantity');
            qtySpan.textContent = `${p.quantity}`;

            li.appendChild(nameSpan); // adicion a span name dentro do li
            li.appendChild(qtySpan); // adicion a span qtdy dentro do li
            ul.appendChild(li); // adiciona li dentro de ul 
        });

    } catch (err) {
        console.error('Erro ao carregar produtos:', err);
    }
}

// get axios cdn content delivery network
// importar o axios

// executado sempre que o formulário for submetido
async function onSubmit(e) {

    e.preventDefault(); // faz com q agr a minha função assuma o submit()
    
    // pegar valores diretamente pelos names do form
    const product = form.product.value.trim();
    const quantityRaw = form.quantity.value;
    const quantity = Number(quantityRaw);

    if (!product) {
        alert('Informe o nome do produto.');
        return;
    }

    if (!quantityRaw || Number.isNaN(quantity) || quantity < 0) {
        alert('Informe uma quantidade válida (>= 0).');
        return;
    }

    try {
        // envia JSON para sua rota /product
        await axios.post('/product', {
            product,
            quantity
        });

        // espero o loadProducts retornar
        await loadProducts();

    } catch (error) {
        console.error("Erro ao adicionar produto:", error);
        alert("Não foi possível adicionar o produto.");
    }
}

form.addEventListener('submit', onSubmit);

loadProducts();

// usar o get.axios