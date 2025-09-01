/**
 * Atividade 2
 * Utilizando os conceitos aplicados anteriormente, 
 * desenvolva uma rota para consultar o clima de uma cidade. 
 * Essa rota receberá o nome de uma cidade como parâmetro, 
 * consultará na API Meteo pelas coordenadas e depois pelos dados da temperatura e 
 * devolverá como resposta. Faça verificações se aquela cidade existe
 */

const cors = require('cors');
const express = require('express');
const axios = require('axios');

const port = 3000;
const hostname = '127.0.0.1';
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static("static"));

app.use(cors()); // permite todas as origens

const logMiddleware = (req, res, next) => {
    console.log(` ${req.method} ${req.url}`);
    next(); // Passa para o próximo middleware ou rota
};
app.use(logMiddleware);

app.get("/weather/:city", async (req, res) => {
    const { city } = req.params; // pega oq vem depois do ?
    try {
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`)
        
        console.log(geoResponse.data.results);

        if (!geoResponse.data.results || geoResponse.data.results.length == 0) {
            return res.status(404).json({ error: "City not found." });
        }

        const {latitude, longitude} = geoResponse.data.results[0];

        const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current_weather=true`);

        const current = weatherResponse.data.current_weather;

        if (!current) {
                return res.status(404).json({ error: "Weather data not found." });
        }

        return res.status(200).json({
            latitude: Number(latitude),
            longitude: Number(longitude),
            temperature: current.temperature,
            windspeed: current.windspeed,
            time: current.time
        });
    } catch (error) {
        console.error("Error consulting th API: ", error.message);
        return res.status(500).json({error: "Internal Server Error to searching data."})
    }
});

app.listen(port, () => {
    console.log(`API está na porta ${port} e rodando em  http://${hostname}:${port}`);
});