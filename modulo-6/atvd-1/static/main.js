const productList = document.getElementById('product-list');
const inputProduct = document.getElementById("input-product");
const inputQuantity = document.getElementById("input-quantity");

const btnPost = document.getElementById("btn-post");
const btnGet = document.getElementById("btn-get");
const btnPatch = document.getElementById("btn-patch");
const btnDelete = document.getElementById("btn-delete");

function addProductToList({id, product, quantity}) {
    const tr = document.createElement("tr");
    tr.className = "product-item";
    tr.dataset.id = id; // guarda o id no DOM

    console.log(id);

    // cria a coluna do id
    const tdId = document.createElement("td");
    tdId.className = "product-id";
    tdId.textContent = id;

    // cria a coluna do produto com input
    const tdProduct = document.createElement("td");
    const inputProd = document.createElement("input");
    inputProd.type = "text";
    inputProd.value = product;

    tdProduct.className = "product-name";
    tdProduct.appendChild(inputProd);

    // cria coluna da quantidade
    const tdQuantity = document.createElement("td");
    const inputQuant = document.createElement("input");
    inputQuant.type = "number";
    inputQuant.min = "0";
    inputQuant.value = quantity;

    tdQuantity.className = "product-quantity";
    tdQuantity.appendChild(inputQuant);

    // COLUNA AÇÕES
    const tdActions = document.createElement("td");

    // DENTRO DE CADA LINHA VOCÊ VAI TER: 
    //BOTÃO ALTERAR
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "EDIT";
    btnEdit.className = "button-action button-primary";
    btnEdit.addEventListener("click", async () => {
        const newProduct = inputProd.value.trim();
        const newQuantity = Number(inputQuant.value);
        const body = {};

        if (!newProduct && isNaN(newQuantity)) {
            return alert("Preencha os campos corretamente.");
        }
        
        // Adiciona 'product' ao corpo se não estiver vazio
        if (newProduct) body.product = newProduct;

         // Adiciona 'quantity' ao corpo se for um número válido
        if (!isNaN(newQuantity) && newQuantity >= 0) body.quantity = newQuantity;

        try {
            const response = await fetch(`http://127.0.0.1:3000/products/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                });

                const data = await response.json();

                if (!response.ok) {
                    return alert(data.message);
                }

                alert(`Product ${data.product} updated successfully!`);
                console.log("Response PATCH:", data);

            } catch(e) {
                console.error("Response ALTER: ", e);
                alert("Error to find ID. Verify the server.");
            }
    });

    // BOTÃO DELETAR
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "DELETE";
    btnDelete.className = "button-action button-danger";
    btnDelete.addEventListener("click", async () => {
        if (!confirm("Are you sure do you want to delete?")) return;

        try {
            const response = await fetch(`http://127.0.0.1:3000/products/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (!response.ok) return alert(data.message);

            alert(`Product ${data.deleted.product} deteled successfuly!`);
        } catch (e) {
            console.error("Response DELETE: ", e);
            alert("Error to find ID. Verify the server.");
        }
    });

    tdActions.appendChild(btnEdit);
    tdActions.appendChild(btnDelete);

    tr.appendChild(tdId);
    tr.appendChild(tdProduct);
    tr.appendChild(tdQuantity);
    tr.appendChild(tdActions);

    productList.appendChild(tr);
}

// BOTÃO DE ADD
btnPost.addEventListener("click", async () => {

     // pega os valores digitados
    const product = inputProduct.value.trim();
    const quantity = Number(inputQuantity.value);

    if (!product || isNaN(quantity)) return alert("Please, fill the fields correctly.");

    try {
        const response = await fetch("http://127.0.0.1:3000/product", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ product, quantity }),
        });

        const data = await response.json();

        if (!response.ok) {
            return alert(data.message);
        }

        alert(data.message);

        addProductToList({ id: data.id, product, quantity });
        
        inputProduct.value = "";
        inputQuantity.value = "";
    } catch (e) {
        console.error("Response POST: ", e);
        alert("Error to find ID. Verify the server.");
    }
});

// BOTÃO DE LISTAR TODOS
btnGet.addEventListener("click", async () => {
    try {
        const response = await fetch("http://127.0.0.1:3000/products");

        const data = await response.json();
        
        if (!response.ok) {
            return alert(data.message);
        }

        // limpa a lista antes de exibir
        productList.replaceChildren();

        // data é um array de produtos { id, product, quantity }
        data.forEach(product => addProductToList(product)); // adiciona os produtos dentro do data

    } catch (e) {
        console.error("Erro: ", e);
    }
});

