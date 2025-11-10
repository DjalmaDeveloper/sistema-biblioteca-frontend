/**
 * Configuração do Frontend - Sistema Biblioteca
 * 
 * Este arquivo centraliza as configurações da aplicação frontend
 */

const API_CONFIG = {
    // Detecta automaticamente o ambiente baseado no hostname
    get baseURL() {
        const hostname = window.location.hostname;

        // Ambiente Local
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8080/api';
        }

        // Ambiente Produção (Render)
        return 'https://sistema-biblioteca-api.onrender.com/api';
    },

    // Timeout padrão para requisições (ms)
    timeout: 30000,

    // Headers padrão
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Função auxiliar para fazer requisições
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;

    const config = {
        ...options,
        headers: {
            ...API_CONFIG.headers,
            ...options.headers
        }
    };

    try {
        console.log(`📡 Requisição: ${options.method || 'GET'} ${url}`);

        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Se for 204 No Content, não tenta fazer parse do JSON
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();
        console.log('✅ Resposta recebida:', data);

        return data;
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        throw error;
    }
}

// Exportar para uso global
window.API_CONFIG = API_CONFIG;
window.fetchAPI = fetchAPI;

console.log('⚙️ Configuração carregada');
console.log('📡 API Base URL:', API_CONFIG.baseURL);