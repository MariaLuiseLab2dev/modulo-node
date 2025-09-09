const { runQuery, getQuery, allQuery } = require('../database/database-helper');
const  bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

exports.createUser = async (req, res, next) => {
    try {
        const { nome, email, senha } = req.body;

        if(!nome || !email || !senha) {
            return res.status(400).json({ error: "O nome, o email e senha são obrigatórios."});
        }
        
        // espera criar um hash com a senha
        const senhaComHash = await bcrypt.hash(senha, SALT_ROUNDS);

        const sql = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;
        const usuarioCriado = await runQuery(sql, [nome, email, senhaComHash]);
        
        if(usuarioCriado.changes == 0) {
            return res.status(404).json({ error: "Usuário não foi criado."});
        }

        return res.status(201).json({ message: "Usuário criado com sucesso."});
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const sql = `SELECT * FROM usuarios`;
        const usuarios = await allQuery(sql);

         // Se não houver nenhum usuário
        if (!usuarios || usuarios.length == 0) {
            return res.status(200).json({
                message: "Nenhum usuário cadastrado no sistema.",
            });
        }
        res.status(200).json({ usuarios: usuarios});
    } catch (error) {
        console.error("Erro ao buscar usuários ", error);
        next(error);
    }
}

exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM usuarios WHERE id = ?`;
        const usuario = await getQuery(sql, [id]);

        // Se não encontrar o usuário
        if (!usuario) {
            return res.status(404).json({
                error: "Usuário não encontrado.",
                id: id
            });
        }

        // Se encontrar
        return res.status(200).json({
            message: "Usuário encontrado com sucesso.",
            usuario: usuario
        });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error.message);
        next(error);
    }
};


exports.updateUserById = async (req, res, next) => {
    const { id } = req.params;
    const { nome, email, senha } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ error: "ID é obrigatório." });
        }

        let sql = '';
        let parametros = [];

        // combinações de campos (maior especificidade primeiro)
        if (nome && email && senha) {
            const hash = await bcrypt.hash(senha, SALT_ROUNDS);
            sql = `UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?`;
            parametros = [nome, email, hash, id];

        } else if (nome && email) {
            sql = `UPDATE usuarios SET nome = ?, email = ? WHERE id = ?`;
            parametros = [nome, email, id];

        } else if (nome && senha) {
            const hash = await bcrypt.hash(senha, SALT_ROUNDS);
            sql = `UPDATE usuarios SET nome = ?, senha = ? WHERE id = ?`;
            parametros = [nome, hash, id];

        } else if (email && senha) {
            const hash = await bcrypt.hash(senha, SALT_ROUNDS);
            sql = `UPDATE usuarios SET email = ?, senha = ? WHERE id = ?`;
            parametros = [email, hash, id];

        } else if (nome) {
            sql = `UPDATE usuarios SET nome = ? WHERE id = ?`;
            parametros = [nome, id];

        } else if (email) {
            sql = `UPDATE usuarios SET email = ? WHERE id = ?`;
            parametros = [email, id];

        } else if (senha) {
            const hash = await bcrypt.hash(senha, SALT_ROUNDS);
            sql = `UPDATE usuarios SET senha = ? WHERE id = ?`;
            parametros = [hash, id];

        } else {
            return res.status(400).json({ error: "Nenhum campo válido enviado." });
        }

        const resultado = await runQuery(sql, parametros);

        if (resultado.changes === 0) {
            return res.status(404).json({ error: `Usuário ${id} não encontrado.` });
        }

        return res.status(200).json({ message: `Usuário ${id} atualizado com sucesso.` });
    } catch (error) {
        next(error);
    }
};


exports.deleteUserById = async (req, res, next) => {
    const { id } = req.params;
    const params = id;
    try {
        const sql = `DELETE FROM usuarios WHERE id = ?`;
        const usuarioDeletado = await runQuery(sql, params);
        if (usuarioDeletado.changes == 0) {
            return res.status(404).json({error: `Usuário ${id} não encontrada.` });
        }
        return res.status(200).json({ message: `Usuário ${id} atualizada com sucesso.`});
    } catch(error) {
        next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const { email, senha } = req.body;
        
        if(!email || !senha) {
            return res.status(400).json({ error: "Email e senha são obrigatórios."})
        }

        const sql = `SELECT email, senha FROM usuarios WHERE email = ?`;

        const consultarEmail = await getQuery(sql, [email]);

        if(!consultarEmail) {
            return res.status(404).json({ error: "Email ou senha não confere." });
        }

        // espera a comparação da senha dada com o hash do banco
        const senhaCorreta = await bcrypt.compare(senha, consultarEmail.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: "Senha incorreta." });
        }

        // se bater, login permitido
        return res.status(200).json({ message: "Login efetuado com sucesso." });
    } catch(error) {
        next(error);
    }
}