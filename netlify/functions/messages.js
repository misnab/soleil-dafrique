const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        if (event.httpMethod === 'GET') {
            const query = 'SELECT * FROM messages ORDER BY created_at DESC';
            const result = await pool.query(query);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.rows)
            };
        }

        if (event.httpMethod === 'POST') {
            const { first_name, last_name, email, phone, message } = JSON.parse(event.body);

            const insertQuery = `
                INSERT INTO messages (first_name, last_name, email, phone, message) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            const result = await pool.query(insertQuery, [first_name, last_name, email, phone, message]);

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: result.rows[0]
                })
            };
        }

        if (event.httpMethod === 'DELETE') {
            const { id } = JSON.parse(event.body);

            const deleteQuery = 'DELETE FROM messages WHERE id = $1';
            await pool.query(deleteQuery, [id]);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Messages error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Erreur serveur' })
        };
    }
};