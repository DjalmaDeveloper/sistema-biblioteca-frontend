// Sistema de Autenticação
const Auth = {
    // Verificar se usuário está logado
    isLoggedIn() {
        return sessionStorage.getItem('usuarioLogado') !== null ||
            localStorage.getItem('usuarioLogado') !== null;
    },

    // Obter dados do usuário logado
    getUser() {
        const sessionUser = sessionStorage.getItem('usuarioLogado');
        const localUser = localStorage.getItem('usuarioLogado');

        if (sessionUser) {
            return JSON.parse(sessionUser);
        } else if (localUser) {
            return JSON.parse(localUser);
        }
        return null;
    },

    // Fazer logout
    logout() {
        sessionStorage.removeItem('usuarioLogado');
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'login.html';
    },

    // Proteger página (requer login)
    protectPage() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    },

    // Verificar nível de acesso
    hasRole(nivel) {
        const user = this.getUser();
        return user && user.nivel === nivel;
    }
};

// Exportar para uso global
window.Auth = Auth;