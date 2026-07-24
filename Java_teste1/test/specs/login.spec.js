import { readFileSync } from 'fs';
import LoginPage from '../pageobjects/login.page.js';
import HomePage from '../pageobjects/home.page.js';

// Lê o arquivo JSON com os dados para teste data-driven de forma compatível com ESModules
const loginData = JSON.parse(readFileSync(new URL('../data/loginData.json', import.meta.url)));

describe('Desafio Mobile: Funcionalidade de Login e Cadastro', () => {
    beforeEach(async () => {
        // Garante que o aplicativo está aberto e navega até a tela de Login/Cadastro
        await HomePage.openLogin();
    });

    it('Cenário 1: Login com credenciais válidas (Sucesso)', async () => {
        await LoginPage.switchTologinTab();
        const data = loginData.validLogin;
        
        await LoginPage.login(data.email, data.password);
        
        // Verifica o alerta nativo de sucesso
        const alertText = await LoginPage.handleNativeAlert();
        expect(alertText).toContain('You are logged in!');
    });

    it('Cenário 2: Login com formato de e-mail inválido (Mensagem de erro)', async () => {
        await LoginPage.switchTologinTab();
        const data = loginData.invalidEmail;
        
        await LoginPage.login(data.email, data.password);
        
        // Valida que o erro apropriado é exibido embaixo do input
        const isErrorVisible = await LoginPage.isValidationErrorVisible(data.expectedError);
        expect(isErrorVisible).toBe(true);
    });

    it('Cenário 3: Login com senha vazia (Mensagem de erro)', async () => {
        await LoginPage.switchTologinTab();
        const data = loginData.emptyPassword;
        
        await LoginPage.login(data.email, data.password);
        
        // Valida a mensagem de validação de campo obrigatório/curto
        const isErrorVisible = await LoginPage.isValidationErrorVisible(data.expectedError);
        expect(isErrorVisible).toBe(true);
    });

    it('Cenário 4: Cadastro de novo usuário com sucesso', async () => {
        await LoginPage.switchToSignUpTab();
        const data = loginData.validSignUp;
        
        await LoginPage.signUp(data.email, data.password, data.confirmPassword);
        
        // Valida o alerta nativo de cadastro efetuado com sucesso
        const alertText = await LoginPage.handleNativeAlert();
        expect(alertText).toContain('You successfully signed up!');
    });

    it('Cenário 5: Cadastro falha com senhas divergentes (Mensagem de erro)', async () => {
        await LoginPage.switchToSignUpTab();
        const data = loginData.passwordMismatch;
        
        await LoginPage.signUp(data.email, data.password, data.confirmPassword);
        
        // Valida a mensagem de erro correspondente ao repeat password
        const isErrorVisible = await LoginPage.isValidationErrorVisible(data.expectedError);
        expect(isErrorVisible).toBe(true);
    });
});
