import request from 'supertest';

const BASE_URL = 'https://serverest.dev';

class UserClient {
    // GET /users - Retorna a lista de usuários
    async getUsers() {
        return await request(BASE_URL)
            .get('/usuarios')
            .set('Accept', 'application/json');
    }

    // GET /users/{id} - Retorna os detalhes de um usuário específico
    async getUserById(id) {
        return await request(BASE_URL)
            .get(`/usuarios/${id}`)
            .set('Accept', 'application/json');
    }

    // POST /users - Cria um novo usuário
    async createUser(body) {
        return await request(BASE_URL)
            .post('/usuarios')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
    }

    // PUT /users/{id} - Atualiza as informações de um usuário
    async updateUser(id, body) {
        return await request(BASE_URL)
            .put(`/usuarios/${id}`)
            .send(body)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
    }

    // DELETE /users/{id} - Exclui um usuário
    async deleteUser(id) {
        return await request(BASE_URL)
            .delete(`/usuarios/${id}`)
            .set('Accept', 'application/json');
    }

    // POST /login - Faz autenticação e retorna o Token JWT
    async login(email, password) {
        return await request(BASE_URL)
            .post('/login')
            .send({ email, password })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
    }
}

export default new UserClient();
