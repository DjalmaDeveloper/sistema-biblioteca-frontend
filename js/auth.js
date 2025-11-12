/**
 * Sistema de Autenticação JWT
 * Gerencia login, logout e autenticação do usuário
 */
const Auth = {
    // Obter token JWT
    getToken() {
        return localStorage.getItem('authToken');
    },

    // Salvar token JWT
    setToken(token) {
        localStorage.setItem('authToken', token);
    },

    // Obter dados do usuário
    getUser() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },

    // Salvar dados do usuário
    setUser(data) {
        localStorage.setItem('userData', JSON.stringify(data));
    },

    // Limpar autenticação
    clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    },

    // Verificar se está autenticado
    isAuthenticated() {
        return !!this.getToken();
    },

    // Alias para compatibilidade
    isLoggedIn() {
        return this.isAuthenticated();
    },

    // Verificar se é ADMIN
    isAdmin() {
        const user = this.getUser();
        return user && user.perfil === 'ADMIN';
    },

    // Verificar nível de acesso (compatibilidade)
    hasRole(nivel) {
        const user = this.getUser();
        return user && user.nivel === nivel;
    },

    // Proteger página (redirecionar para login se não autenticado)
    protectPage() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
        }
    },

    // Fazer logout
    logout() {
        this.clearAuth();
        window.location.href = 'login.html';
    },

    // Login via API
    async login(usuario, senha) {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, senha })
            });

            if (!response.ok) {
                throw new Error('Usuário ou senha inválidos');
            }

            const data = await response.json();

            // Salvar token e dados do usuário
            this.setToken(data.token);
            this.setUser({
                id: data.id,
                usuario: data.usuario,
                nome: data.nome,
                email: data.email,
                perfil: data.role
            });

            console.log('✅ Login realizado com sucesso');
            return data;
        } catch (error) {
            console.error('❌ Erro no login:', error);
            throw error;
        }
    },

    // Registro via API
    async register(usuario, nome, email, senha) {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, nome, email, senha })
            });

            if (!response.ok) {
                throw new Error('Erro ao criar conta. Usuário ou e-mail já existe!');
            }

            const data = await response.json();

            // Salvar token e dados do usuário
            this.setToken(data.token);
            this.setUser({
                id: data.id,
                usuario: data.usuario,
                nome: data.nome,
                email: data.email,
                perfil: data.role
            });

            console.log('✅ Conta criada com sucesso');
            return data;
        } catch (error) {
            console.error('❌ Erro no registro:', error);
            throw error;
        }
    }
};

// Exportar para uso global
window.Auth = Auth;

console.log('✅ Sistema de autenticação carregado');
