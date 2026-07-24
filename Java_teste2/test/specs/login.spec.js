import { expect } from 'chai';
import UserClient from '../clients/user.client.js';
import { generateRandomUser } from '../utils/utils.js';

describe('Desafio API: Autenticação e JWT', () => {
    let testUser;
    let createdUserId;

    before(async () => {
        // Cria um usuário válido na base para realizar o teste de login com sucesso
        testUser = generateRandomUser();
        const res = await UserClient.createUser(testUser);
        createdUserId = res.body._id;
    });

    it('Cenário 11: Autenticação realizada com sucesso e validação de recebimento de Token JWT (POST /login)', async () => {
        const response = await UserClient.login(testUser.email, testUser.password);
        
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message', 'Login realizado com sucesso');
        expect(response.body).to.have.property('authorization');
        expect(response.body.authorization).to.be.a('string');
        // Valida se o formato do token retornado segue a convenção Bearer JWT
        expect(response.body.authorization).to.contain('Bearer');
    });

    it('Cenário 12: Falha de autenticação com senha incorreta (POST /login)', async () => {
        const response = await UserClient.login(testUser.email, 'senha_errada_de_teste');
        
        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('message', 'Email e/ou senha inválidos');
        expect(response.body).to.not.have.property('authorization');
    });

    // Limpa a base excluindo o usuário de teste
    after(async () => {
        if (createdUserId) {
            await UserClient.deleteUser(createdUserId);
        }
    });
});
