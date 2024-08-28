const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

exports.registerUser = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const newUser = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
            [nome, email, hashedPassword]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'E-mail ou senha inválidos' });
        }

        const validPassword = await bcrypt.compare(senha, user.rows[0].senha);

        if (!validPassword) {
            return res.status(400).json({ error: 'E-mail ou senha inválidos' });
        }

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao realizar login' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, senha_antiga, senha_nova } = req.body;

    try {
        if (!email || !senha_antiga || !senha_nova) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const validPassword = await bcrypt.compare(senha_antiga, user.rows[0].senha);

        if (!validPassword) {
            return res.status(400).json({ error: 'Senha antiga incorreta' });
        }

        if (senha_antiga === senha_nova) {
            return res.status(400).json({ error: 'A nova senha deve ser diferente da antiga' });
        }

        const hashedNewPassword = await bcrypt.hash(senha_nova, 10);

        await pool.query('UPDATE usuarios SET senha = $1 WHERE email = $2', [hashedNewPassword, email]);

        console.log(`E-mail enviado para ${email}: Sua senha foi alterada com sucesso.`);

        res.status(200).json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
};
