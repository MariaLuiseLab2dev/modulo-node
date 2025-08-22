const prompt = require('prompt');
const atvd1 = require('./atvd1');
const atvd2 = require('./atvd2');
const atvd3 = require('./atvd3');

function perguntarOpcao() {
    return new Promise((resolve, reject) => {
        prompt.get(
            {
                name: "pergunta",
                description: "Digite: \n- 0 para gorjeta \n- 1 para calculadora \n- 2 para conversor de temperatura\n",
                required: true,
                type: "number",
                conform: (v) => [0, 1, 2].includes(v), // verifica se o usuário digitou 0, 1 ou 2
                message: "Por favor, insira 0, 1 ou 2."
            },
            (err, result) => {
                if (err) return reject(err);
                resolve(result.pergunta);
            }
        );
    });
}

async function perguntaAtividade() {
    prompt.start();

    try {
        const opcao = await perguntarOpcao();
        let resposta = null;

        switch (opcao) { // se der certo, vem com o resolve
            case 0:
                resposta = await atvd1.calculadoraGorjetas();
                break;
            case 1:
                resposta = await atvd2.calculadora();
                break;
            case 2:
                resposta = await atvd3.conversorDeTemperatura();
                break;
            default:
                console.log('Opção inválida.');
                return;
        }

        if (resposta !== null) {
            console.log('Resultado:', resposta);
        }
    } catch (e) {
        console.error('Erro:', e);
    }
}

perguntaAtividade();
