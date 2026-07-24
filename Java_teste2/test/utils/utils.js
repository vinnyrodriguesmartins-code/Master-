// Gerador dinâmico de dados de usuário para evitar duplicidade de e-mails nos testes
export function generateRandomUser(isAdmin = "true") {
    const uniqueId = Math.floor(Math.random() * 1000000) + Date.now().toString().slice(-6);
    return {
        nome: `Usuário Carrefour ${uniqueId}`,
        email: `carrefour.user.${uniqueId}@teste.com`,
        password: `SecurePass_${uniqueId}`,
        administrador: isAdmin
    };
}
