const pool = require('../../config/db');

class User {
    static async create(nome, email, senha) {
        const query = `
      INSERT INTO usuarios (nome, email, senha) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
        const values = [nome, email, senha];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = `SELECT * FROM usuarios WHERE email = $1;`;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    static async updatePassword(email, novaSenha) {
        const query = `
      UPDATE usuarios 
      SET senha = $1 
      WHERE email = $2 
      RETURNING *;
    `;
        const result = await pool.query(query, [novaSenha, email]);
        return result.rows[0];
    }
}

module.exports = User;
