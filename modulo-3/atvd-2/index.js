const axios = require('axios');
const prompt = require('prompt');

/**
 * Pesquise e leia sobre o pacote axios e instale ele num projeto. 
 * Seu desafio é realizar uma requisição GET para a rota de estados da BrasilAPI (brasilapi.com.br/api/ibge/uf/v1), 
 * exibir para o usuário essa lista de estados e pedir para ele escolher um estado. 
 * O estado escolhido deve ser utilizado para buscar uma lista de cidades no BrasilAPI também, 
 * utilizando a rota https://brasilapi.com.br/api/ibge/municípios/v1/SIGLA_ESTADO?providers=dados-abertos-br,gov,wikipedia. 
 * Mostre a lista de cidades para o usuário.
 */

// função que retorna uma Promise
function perguntaSigla() {
    return new Promise((resolve, reject) => {
        prompt.start();
        prompt.get([
            {
                name:"sigla", 
                description:"Digite a sigla do estado desejado",
                required: true,
                message:"Digite um estado válido."
            }
        ], (err, result) => {
            console.log(result);
            if(err) {
                console.error("Erro: ", err);
                return reject(err); 
            } else {
                if(!result.sigla.trim()) {
                    console.error('Valor vazio recebido.');
                    return reject(new Error('Valor vazio recebido.'));
                }
                resolve(result.sigla.toUpperCase());
            }
        });
    });
}

async function buscaEstado() {
    try {
        //1º realizar uma requisição get pra retornar todos os estados
        const response = await axios.get("https://brasilapi.com.br/api/ibge/uf/v1")
        console.log("\nLISTA DE ESTADOS: ");
        // listar estados
        response.data.forEach( (estado) => { // para cada estado
            console.log(`${estado.sigla}: ${estado.nome}`);
        });

        // pergunta qual estado quer escolher
        const sigla = await perguntaSigla();

        // verifica se o que o usuário digitou bate com a lista
        const estadoValido = response.data.find((estado) => estado.sigla === sigla);

        // se o estado não existir/vier null/
        if (!estadoValido) {
            console.log("Essa sigla de estado não existe.");
            return null;
        } 
        // retorna a sigla
        return sigla;
    } catch(error) {
        console.error(`Erro ao buscar os estados:\nstatus: ${error.status}\nmessage:${error.message}`);
    }
}

async function buscaMunicipio(sigla) {
    // se a sigla for vazia
    
    try {
        const response = await axios.get(`https://brasilapi.com.br/api/ibge/municipios/v1/${sigla}?providers=dados-abertos-br,gov,wikipedia`);
        console.log("\nLISTA DE CIDADES: ");
        response.data.forEach((cidade) => {
            const cidadeFormatada = cidade.nome
            .toLowerCase()
            .replace(/ \(.+\)/g, "")
			.replace(/^./, (c) => c.toUpperCase());
            console.log(cidadeFormatada);
        });
        
    } catch (error) {
        console.error(`Erro: ${error.status} - ${error.message}`);
    }
}

async function main() {
    const sigla = await buscaEstado();
    await buscaMunicipio(sigla);
}

main();