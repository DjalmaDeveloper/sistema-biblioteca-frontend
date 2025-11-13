/**
 * Sistema de Autenticação - Sistema Biblioteca
 * 
 * Gerencia login, logout e proteção de páginas
 */

const Auth = {
    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = this.getToken();
        return token !== null && token !== undefined && token !== '';
    },

    /**
     * Obtém o token JWT
     * @returns {string|null}
     */
    getToken() {
        const sessionUser = sessionStorage.getItem('usuarioLogado');
        const localUser = localStorage.getItem('usuarioLogado');
        const userData = sessionUser || localUser;

        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.token;
            } catch (e) {
                console.error('Erro ao obter token:', e);
                return null;
            }
        }

        return null;
    },

    /**
     * Obtém os dados do usuário logado
     * @returns {object|null}
     */
    getUser() {
        const sessionUser = sessionStorage.getItem('usuarioLogado');
        const localUser = localStorage.getItem('usuarioLogado');
        const userData = sessionUser || localUser;

        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (e) {
                console.error('Erro ao obter usuário:', e);
                return null;
            }
        }

        return null;
    },

    /**
     * Verifica se o usuário tem um perfil específico
     * @param {string} role - Perfil a verificar (ex: 'ADMIN', 'USER', 'BIBLIOTECARIO')
     * @returns {boolean}
     */
    hasRole(role) {
        const user = this.getUser();
        if (!user || !user.perfil) {
            return false;
        }

        // Suportar tanto 'perfil' quanto 'role' para compatibilidade
        const userRole = user.perfil || user.role;
        return userRole === role;
    },

    /**
     * Verifica se o usuário tem pelo menos um dos perfis especificados
     * @param {string[]} roles - Array de perfis (ex: ['ADMIN', 'BIBLIOTECARIO'])
     * @returns {boolean}
     */
    hasAnyRole(roles) {
        const user = this.getUser();
        if (!user || !user.perfil) {
            return false;
        }

        const userRole = user.perfil || user.role;
        return roles.includes(userRole);
    },

    /**
     * Protege uma página - redireciona para login se não autenticado
     * @param {string} requiredRole - Perfil necessário (opcional)
     */
    protectPage(requiredRole = null) {
        if (!this.isAuthenticated()) {
            console.warn('🔒 Usuário não autenticado. Redirecionando para login...');
            window.location.href = 'login.html';
            return;
        }

        // Se requer um perfil específico, verificar
        if (requiredRole && !this.hasRole(requiredRole)) {
            console.warn(`🔒 Acesso negado. Perfil necessário: ${requiredRole}`);
            this.showAccessDenied();
            return;
        }

        console.log('✅ Usuário autenticado:', this.getUser().usuario);
    },

    /**
     * Exibe mensagem de acesso negado
     */
    showAccessDenied() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: Arial, sans-serif;
            ">
                <div style="
                    background: white;
                    border-radius: 15px;
                    padding: 50px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    max-width: 500px;
                ">
                    <i class="fas fa-shield-alt" style="font-size: 5rem; color: #dc3545; margin-bottom: 20px;"></i>
                    <h2>Acesso Negado</h2>
                    <p class="lead">Você não tem permissão para acessar esta página.</p>
                    <button onclick="window.location.href='index.html'" class="btn btn-primary mt-3">
                        <i class="fas fa-home"></i> Voltar para Início
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Salva os dados do usuário após login
     * @param {object} userData - Dados do usuário (deve conter token)
     * @param {boolean} rememberMe - Manter conectado
     */
    saveUser(userData, rememberMe = false) {
        const userString = JSON.stringify(userData);
        
        if (rememberMe) {
            localStorage.setItem('usuarioLogado', userString);
            sessionStorage.removeItem('usuarioLogado');
        } else {
            sessionStorage.setItem('usuarioLogado', userString);
            localStorage.removeItem('usuarioLogado');
        }

        console.log('✅ Usuário salvo:', userData.usuario);
    },

    /**
     * Faz login do usuário
     * @param {string} usuario - Nome de usuário
     * @param {string} senha - Senha
     * @param {boolean} rememberMe - Manter conectado
     * @returns {Promise<object>} - Dados do usuário
     */
    async login(usuario, senha, rememberMe = false) {
        try {
            const response = await fetch(`${window.API_CONFIG.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, senha })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Erro ao fazer login');
            }

            const userData = await response.json();
            this.saveUser(userData, rememberMe);

            return userData;
        } catch (error) {
            console.error('❌ Erro no login:', error);
            throw error;
        }
    },

    /**
     * Faz logout do usuário
     */
    logout() {
        localStorage.removeItem('usuarioLogado');
        sessionStorage.removeItem('usuarioLogado');
        console.log('👋 Logout realizado');
        window.location.href = 'login.html';
    },

    /**
     * Registra um novo usuário
     * @param {object} userData - Dados do usuário
     * @returns {Promise<object>}
     */
    async register(userData) {
        try {
            const response = await fetch(`${window.API_CONFIG.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Erro ao registrar usuário');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Erro no registro:', error);
            throw error;
        }
    }
};

// Exportar para uso global
window.Auth = Auth;

console.log('🔐 Sistema de autenticação carregado');

