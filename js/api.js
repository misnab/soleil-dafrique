// API Client pour les fonctions Netlify
class API {
    static BASE_URL = '/.netlify/functions';

    static async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body !== 'string') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erreur réseau');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentification
    static async login(email, password) {
        return this.request('/auth', {
            method: 'POST',
            body: { action: 'login', email, password }
        });
    }

    static async register(firstName, lastName, email, phone, password) {
        return this.request('/auth', {
            method: 'POST',
            body: { 
                action: 'register', 
                first_name: firstName, 
                last_name: lastName, 
                email, 
                phone, 
                password 
            }
        });
    }

    // Messages
    static async sendMessage(firstName, lastName, email, phone, message) {
        return this.request('/messages', {
            method: 'POST',
            body: { first_name: firstName, last_name: lastName, email, phone, message }
        });
    }

    static async getMessages() {
        return this.request('/messages');
    }

    static async deleteMessage(id) {
        return this.request('/messages', {
            method: 'DELETE',
            body: { id }
        });
    }

    // Visiteurs
    static async getVisitors() {
        return this.request('/visitors');
    }

    static async getRecentVisitors() {
        return this.request('/visitors?recent=true');
    }

    static async deleteVisitor(id) {
        return this.request('/visitors', {
            method: 'DELETE',
            body: { id }
        });
    }

    // Actualités
    static async getNews() {
        return this.request('/news');
    }

    static async createNews(title, content, publication_date) {
        return this.request('/news', {
            method: 'POST',
            body: { title, content, publication_date }
        });
    }

    static async deleteNews(id) {
        return this.request('/news', {
            method: 'DELETE',
            body: { id }
        });
    }

    // Statistiques
    static async getStats() {
        const [visitors, messages, news] = await Promise.all([
            this.getVisitors(),
            this.getMessages(),
            this.getNews()
        ]);

        return {
            visitors: visitors.length,
            messages: messages.length,
            news: news.length
        };
    }

    static async getRecentMessages() {
        const messages = await this.getMessages();
        return messages.slice(0, 5);
    }
}