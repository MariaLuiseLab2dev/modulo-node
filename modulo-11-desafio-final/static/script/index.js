document.getElementById('backoffice').addEventListener('click', async () => {
    try {
        window.location.href = "backoffice.html";
    } catch (error){
        alert("Erro ao ir pro backoffice");
    }
});

document.getElementById('storedev').addEventListener('click', async () => {
    try {
        window.location.href = "storedev.html";
    } catch (error){
        alert("Erro ao ir pro storedev");
    }
});