const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        if (event.httpMethod === 'GET') {
            const isRecent = event.queryStringParameters?.recent === 'true';
            
            let query = 'SELECT id, first_name, last_name, email, phone, created_at FROM visitors ORDER BY created_at DESC';
            if (isRecent) {
                query += ' LIMIT 5';
            }

            const result = await pool.query(query);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.rows)
            };
        }

        if (event.httpMethod === 'DELETE') {
            const { id } = JSON.parse(event.body);

            const deleteQuery = 'DELETE FROM visitors WHERE id = $1';
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
        console.error('Visitors error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Erreur serveur' })
        };
    }
};