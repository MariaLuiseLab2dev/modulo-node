const alertModal = document.getElementById("alertModal");
const alertBox = document.getElementById("alertBox");
const alertIcon = document.getElementById("alertIcon"); // <img>
const alertTitle = document.getElementById("alertTitle");
const alertMessage = document.getElementById("alertMessage");
const alertClose = document.getElementById("alertClose");

let alertTimeoutId = null;

function showAlert({ tipo = "info", mensagem = "", duracao = 3000 } = {}) {
    // Limpa timeout anterior
    if (alertTimeoutId) {
        clearTimeout(alertTimeoutId);
        alertTimeoutId = null;
    }

    // Remove classes antigas e aplica a nova
    alertBox.classList.remove("success", "error", "info");
    alertBox.classList.add(tipo);

    // Definindo ícone e título conforme o tipo
    if (tipo === "success") {
        alertIcon.src = "img/success.svg";
        alertIcon.alt = "Ícone de sucesso";
        alertTitle.textContent = "Sucesso";
    } else if (tipo === "error") {
        alertIcon.src = "img/error.svg";
        alertIcon.alt = "Ícone de erro";
        alertTitle.textContent = "Erro";
    } else {
        alertIcon.src = "img/info.svg";
        alertIcon.alt = "Ícone de informação";
        alertTitle.textContent = "Informação";
    }

    // Define a mensagem
    alertMessage.textContent = mensagem;

    // Exibe o modal
    alertModal.style.display = "flex";
    alertModal.setAttribute("aria-hidden", "false");

    // Fecha automaticamente se duracao > 0
    if (duracao > 0) {
        alertTimeoutId = setTimeout(() => {
            closeAlert();
            alertTimeoutId = null;
        }, duracao);
    }
}

function closeAlert() {
    alertModal.style.display = "none";
    alertModal.setAttribute("aria-hidden", "true");

    alertTitle.textContent = "";
    alertMessage.textContent = "";
    alertIcon.src = "";
    alertIcon.alt = "";

    alertBox.classList.remove("success", "error", "info");

    if (alertTimeoutId) {
        clearTimeout(alertTimeoutId);
        alertTimeoutId = null;
    }
}

// Eventos de fechamento
alertClose.addEventListener("click", closeAlert);
alertModal.addEventListener("click", (e) => {
    if (e.target === alertModal) closeAlert();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && alertModal.style.display === "flex") {
        closeAlert();
    }
});
