-- Script d'initialisation de la base de données
-- À exécuter dans pgAdmin ou votre client PostgreSQL

-- Table admin
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table visitors
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Table news
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    publication_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE
);

-- Insertion d'un admin par défaut
-- Mot de passe: admin123
INSERT INTO admin (email, password_hash, first_name, last_name) 
VALUES ('admin@soleil-afrique.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Système')
ON CONFLICT (email) DO NOTHING;

-- Insertion d'actualités par défaut
INSERT INTO news (title, content, publication_date) VALUES 
('Rentrée Scolaire 2025', 'La rentrée scolaire 2025 se déroulera dans d''excellentes conditions. Inscriptions ouvertes pour tous les niveaux. Nous accueillons les élèves avec des infrastructures modernisées et un corps enseignant qualifié pour garantir une formation de qualité.', '2025-09-15'),
('Résultats Exceptionnels 2023', 'Nous sommes fiers d''annoncer 100% de réussite au BEPC et plus de 70% au Baccalauréat pour l''année 2023. Ces résultats témoignent de l''engagement de nos enseignants et de la qualité de notre enseignement. Félicitations à tous nos élèves !', '2024-01-10'),
('Nouveau Laboratoire Informatique', 'Nous travaillons sur l''informatique et nous nous préparons à inaugurer notre nouveau laboratoire prochainement. Cet espace moderne permettra à nos élèves de se familiariser avec les nouvelles technologies et de développer leurs compétences numériques.', '2024-03-01')
ON CONFLICT DO NOTHING;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_visitors_email ON visitors(email);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_news_publication_date ON news(publication_date);

-- Vues pour les statistiques
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM visitors) AS total_visitors,
    (SELECT COUNT(*) FROM messages) AS total_messages,
    (SELECT COUNT(*) FROM news WHERE is_published = true) AS total_news,
    (SELECT COUNT(*) FROM messages WHERE created_at >= CURRENT_DATE) AS messages_today;