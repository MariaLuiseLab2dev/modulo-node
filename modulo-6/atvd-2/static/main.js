const resultadoDiv = document.getElementById("result");

const formatarHorario = (formatoIso) => {
  const data = new Date(formatoIso + "Z"); // adiciona o Z
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, 
    timeZone: "America/Sao_Paulo"
  }).format(data);
};

async function getWeather() {
    const city = document.getElementById("cityInput").value;
    if (!city) {
        alert("Digite o nome de uma cidade!");
        return;
    }

    try {
        const response = await fetch(`/weather/${city}`);

        if(!response.ok) {
            throw new Error(data.message || `Status ${response.status}`);
        }
        const data = await response.json();
        
        resultadoDiv.replaceChildren(); // limpa antes de adicionar os novos elementos

        // Cidade
        const h2 = document.createElement("h2");
        h2.textContent = data.city;

        // Latitude
        const pLat = document.createElement("p");
        pLat.textContent = `Latitude: ${data.latitude}`;

        // Longitude
        const pLon = document.createElement("p");
        pLon.textContent = `Longitude: ${data.longitude}`;

        // Temperatura
        const pTemp = document.createElement("p");
        pTemp.textContent = `Temperatura: ${data.temperature}`;

        // Vento
        const pWind = document.createElement("p");
        pWind.textContent = `Vento: ${data.windspeed} km/h`;

        // Hora
        const pTime = document.createElement("p");
        pTime.textContent = `Hora: ${formatarHorario(data.time)}`;

        // Agora adiciona todos de uma vez na div
        resultadoDiv.append(h2, pLat, pLon, pTemp, pWind, pTime);
    } catch (err) {
        document.getElementById("result").innerHTML = `<p>Erro ao buscar clima!</p>`;
    }
}