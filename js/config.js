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
 * Obtém o token JWT do localStorage ou sessionStorage
 * @returns {string|null} - Token JWT ou null se não encontrado
 */
function getAuthToken() {
    // Tentar obter de sessionStorage primeiro (mantém-me conectado = false)
    const sessionUser = sessionStorage.getItem('usuarioLogado');
    if (sessionUser) {
        try {
            const userData = JSON.parse(sessionUser);
            return userData.token;
        } catch (e) {
            console.error('Erro ao fazer parse do usuário da sessão:', e);
        }
    }

    // Tentar obter de localStorage (mantém-me conectado = true)
    const localUser = localStorage.getItem('usuarioLogado');
    if (localUser) {
        try {
            const userData = JSON.parse(localUser);
            return userData.token;
        } catch (e) {
            console.error('Erro ao fazer parse do usuário local:', e);
        }
    }

    return null;
}

/**
 * Função para fazer requisições à API com JWT automático
 * @param {string} endpoint - Endpoint da API (ex: '/usuarios')
 * @param {object} options - Opções do fetch
 * @returns {Promise} - Promessa com os dados da resposta
 */
async function fetchAPI(endpoint, options = {}) {
    const token = getAuthToken();
    const url = `${API_CONFIG.baseURL}${endpoint}`;

    const defaultHeaders = {
        ...API_CONFIG.headers
    };

    // Adicionar token se disponível e não for endpoint de auth
    if (token && !endpoint.startsWith('/auth')) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token JWT adicionado ao header');
    } else if (!endpoint.startsWith('/auth')) {
        console.warn('⚠️ Token JWT não encontrado');
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
        console.log('📋 Headers:', config.headers);

        const response = await fetch(url, config);

        // Se não autorizado, fazer logout
        if (response.status === 401 || response.status === 403) {
            if (!endpoint.startsWith('/auth')) {
                console.warn('🔒 Sessão expirada ou acesso negado. Redirecionando para login...');
                localStorage.removeItem('usuarioLogado');
                sessionStorage.removeItem('usuarioLogado');
                
                // Evitar loop de redirecionamento
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
                throw new Error(`HTTP ${response.status}: Acesso negado`);
            }
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        // Retornar resposta vazia para 204 No Content
        if (response.status === 204) {
            console.log('✅ Resposta: 204 No Content');
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
 * @param {number} duration - Duração em ms (padrão: 5000)
 */
function showAlert(message, type = 'success', duration = 5000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Tentar inserir no container de alertas se existir
    let container = document.getElementById('alertContainer');
    
    // Se não houver container específico, usar o container principal
    if (!container) {
        container = document.querySelector('.container');
    }
    
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-remover após duração especificada
        setTimeout(() => {
            alertDiv.remove();
        }, duration);
    } else {
        console.warn('Container para alerta não encontrado');
    }
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean}
 */
function isAuthenticated() {
    return getAuthToken() !== null;
}

/**
 * Obtém os dados do usuário logado
 * @returns {object|null}
 */
function getUser() {
    const sessionUser = sessionStorage.getItem('usuarioLogado');
    const localUser = localStorage.getItem('usuarioLogado');
    const userData = sessionUser || localUser;

    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error('Erro ao fazer parse dos dados do usuário:', e);
            return null;
        }
    }

    return null;
}

// Exportar para uso global
window.API_CONFIG = API_CONFIG;
window.API_URL = API_CONFIG.baseURL; // Compatibilidade com código existente
window.fetchAPI = fetchAPI;
window.showAlert = showAlert;
window.getAuthToken = getAuthToken;
window.isAuthenticated = isAuthenticated;
window.getUser = getUser;

console.log('⚙️ Configuração carregada');
console.log('📡 API Base URL:', API_CONFIG.baseURL);
console.log('🔐 Usuário autenticado:', isAuthenticated());

