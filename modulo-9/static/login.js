document.getElementById('btnLogin').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        alert("Preencha todos os campos");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error); // mostra erro do back
            return;
        }

        alert(data.message); // mostra "Login efetuado com sucesso."
        window.location.href = "home.html";
    } catch (err) {
        console.error(err);
        alert("Erro ao conectar ao servidor");
    }
});
