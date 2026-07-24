import { expect } from 'chai';
import UserClient from '../clients/user.client.js';
import { generateRandomUser } from '../utils/utils.js';

describe('Desafio API: Gerenciamento de Usuários (CRUD)', () => {
    let createdUserId;
    let testUser;

    beforeEach(() => {
        testUser = generateRandomUser();
    });

    it('Cenário 1: Cadastro de novo usuário com sucesso (POST)', async () => {
        const response = await UserClient.createUser(testUser);
        
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
        expect(response.body).to.have.property('_id');
        
        // Armazena o ID do usuário criado para uso nos próximos cenários
        createdUserId = response.body._id;
    });

    it('Cenário 2: Tentativa de cadastro com e-mail duplicado (POST - Falha)', async () => {
        // Usa os mesmos dados do usuário criado no Cenário 1
        const response = await UserClient.createUser(testUser);
        
        // Se por algum motivo o teste rodar isolado, cadastramos um e-mail primeiro
        if (response.status === 201) {
            const secondResponse = await UserClient.createUser(testUser);
            expect(secondResponse.status).to.equal(400);
            expect(secondResponse.body).to.have.property('message', 'Este email já está sendo usado');
            await UserClient.deleteUser(response.body._id); // limpa
        } else {
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('message', 'Este email já está sendo usado');
        }
    });

    it('Cenário 3: Validação de campos obrigatórios ausentes (POST - Falha)', async () => {
        const invalidUser = {
            nome: '',
            email: 'email.invalido@teste.com',
            // password ausente
            administrador: 'false'
        };

        const response = await UserClient.createUser(invalidUser);
        
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('nome', 'nome não pode ficar em branco');
        expect(response.body).to.have.property('password', 'password é obrigatório');
    });

    it('Cenário 4: Listagem de todos os usuários (GET)', async () => {
        const response = await UserClient.getUsers();
        
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('quantidade');
        expect(response.body).to.have.property('usuarios');
        expect(response.body.usuarios).to.be.an('array');
    });

    it('Cenário 5: Consulta de detalhes de usuário existente (GET /users/{id})', async () => {
        // Se o usuário não foi criado ainda, cria um rápido
        if (!createdUserId) {
            const res = await UserClient.createUser(testUser);
            createdUserId = res.body._id;
        }

        const response = await UserClient.getUserById(createdUserId);
        
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('_id', createdUserId);
        expect(response.body).to.have.property('nome');
        expect(response.body).to.have.property('email');
        expect(response.body).to.have.property('password');
        expect(response.body).to.have.property('administrador');
    });

    it('Cenário 6: Consulta de usuário com ID inexistente (GET /users/{id} - Falha)', async () => {
        const fakeId = '0000000000000000'; // ID válido de 16 caracteres que não existe na base
        const response = await UserClient.getUserById(fakeId);
        
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('message', 'Usuário não encontrado');
    });

    it('Cenário 7: Atualização de dados de usuário existente (PUT)', async () => {
        if (!createdUserId) {
            const res = await UserClient.createUser(testUser);
            createdUserId = res.body._id;
        }

        const updatedData = {
            nome: 'Nome Atualizado Carrefour',
            email: `updated.${createdUserId}@teste.com`,
            password: 'NewSecurePassword123',
            administrador: 'true'
        };

        const response = await UserClient.updateUser(createdUserId, updatedData);
        
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message', 'Registro alterado com sucesso');
    });

    it('Cenário 8: Criação de usuário via PUT caso o ID não exista', async () => {
        const fakeId = 'id_nao_cadastrado_' + Math.floor(Math.random() * 100000);
        const newUserData = generateRandomUser();

        const response = await UserClient.updateUser(fakeId, newUserData);
        
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
        expect(response.body).to.have.property('_id');
        
        // Limpa o registro criado pelo PUT
        await UserClient.deleteUser(response.body._id);
    });

    it('Cenário 9: Exclusão de usuário existente por ID (DELETE)', async () => {
        if (!createdUserId) {
            const res = await UserClient.createUser(testUser);
            createdUserId = res.body._id;
        }

        const response = await UserClient.deleteUser(createdUserId);
        
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message', 'Registro excluído com sucesso');
        
        // Reseta a variável para não tentar excluir novamente no after
        createdUserId = null;
    });

    it('Cenário 10: Exclusão de usuário com ID inexistente ou já deletado (DELETE)', async () => {
        const fakeId = 'id_ja_excluido_999';
        const response = await UserClient.deleteUser(fakeId);
        
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message', 'Nenhum registro excluído');
    });

    // Limpeza após a execução da suite de testes
    after(async () => {
        if (createdUserId) {
            await UserClient.deleteUser(createdUserId);
        }
    });
});
