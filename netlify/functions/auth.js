const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const { action, email, password, first_name, last_name, phone } = JSON.parse(event.body);

        if (action === 'login') {
            // Vérifier dans la table admin
            const adminQuery = 'SELECT * FROM admin WHERE email = $1';
            const adminResult = await pool.query(adminQuery, [email]);

            if (adminResult.rows.length > 0) {
                const admin = adminResult.rows[0];
                const validPassword = await bcrypt.compare(password, admin.password_hash);

                if (validPassword) {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            user: {
                                id: admin.id,
                                first_name: admin.first_name,
                                last_name: admin.last_name,
                                email: admin.email,
                                role: 'admin'
                            }
                        })
                    };
                }
            }

            // Vérifier dans la table visitors
            const visitorQuery = 'SELECT * FROM visitors WHERE email = $1';
            const visitorResult = await pool.query(visitorQuery, [email]);

            if (visitorResult.rows.length > 0) {
                const visitor = visitorResult.rows[0];
                const validPassword = await bcrypt.compare(password, visitor.password_hash);

                if (validPassword) {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            user: {
                                id: visitor.id,
                                first_name: visitor.first_name,
                                last_name: visitor.last_name,
                                email: visitor.email,
                                phone: visitor.phone,
                                role: 'visitor'
                            }
                        })
                    };
                }
            }

            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ success: false, message: 'Email ou mot de passe incorrect' })
            };

        } else if (action === 'register') {
            // Vérifier si l'email existe déjà
            const checkQuery = 'SELECT email FROM visitors WHERE email = $1 UNION SELECT email FROM admin WHERE email = $1';
            const checkResult = await pool.query(checkQuery, [email]);

            if (checkResult.rows.length > 0) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, message: 'Cet email est déjà utilisé' })
                };
            }

            // Hasher le mot de passe
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // Insérer le nouveau visiteur
            const insertQuery = `
                INSERT INTO visitors (first_name, last_name, email, phone, password_hash) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING id, first_name, last_name, email, phone
            `;
            const insertResult = await pool.query(insertQuery, [first_name, last_name, email, phone, password_hash]);
            const newVisitor = insertResult.rows[0];

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    user: {
                        ...newVisitor,
                        role: 'visitor'
                    }
                })
            };
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Action non reconnue' })
        };

    } catch (error) {
        console.error('Auth error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'Erreur serveur' })
        };
    }
};