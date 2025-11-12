/**
 * Configuração do Frontend - Sistema Biblioteca
 * 
 * Este arquivo centraliza as configurações da aplicação frontend
 * e fornece funções auxiliares para requisições HTTP com JWT
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

/**
 * Função para fazer requisições à API com JWT automático
 * @param {string} endpoint - Endpoint da API (ex: '/usuarios')
 * @param {object} options - Opções do fetch
 * @returns {Promise} - Promessa com os dados da resposta
 */
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const url = `${API_CONFIG.baseURL}${endpoint}`;

    const defaultHeaders = {
        ...API_CONFIG.headers
    };

    // Adicionar token se disponível e não for endpoint de auth
    if (token && !endpoint.startsWith('/auth')) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        console.log(`📡 Requisição: ${options.method || 'GET'} ${url}`);

        const response = await fetch(url, config);

        // Se não autorizado, fazer logout
        if (response.status === 401 || response.status === 403) {
            if (!endpoint.startsWith('/auth')) {
                console.warn('🔒 Sessão expirada. Redirecionando para login...');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                window.location.href = 'login.html';
                throw new Error('Sessão expirada');
            }
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Retornar resposta vazia para 204 No Content
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();
        console.log('✅ Resposta recebida:', data);

        return data;
    } catch (error) {
        console.error(`❌ Erro na requisição para ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Função auxiliar para exibir alertas
 * @param {string} message - Mensagem do alerta
 * @param {string} type - Tipo do alerta (success, danger, warning, info)
 */
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Exportar para uso global
window.API_CONFIG = API_CONFIG;
window.fetchAPI = fetchAPI;
window.showAlert = showAlert;

console.log('⚙️ Configuração carregada');
console.log('📡 API Base URL:', API_CONFIG.baseURL);
