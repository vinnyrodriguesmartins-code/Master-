import HomePage from '../pageobjects/home.page.js';
import FormsPage from '../pageobjects/forms.page.js';

describe('Desafio Mobile: Preenchimento de Formulários', () => {
    beforeEach(async () => {
        // Navega até a tela de Forms antes de cada cenário
        await HomePage.openForms();
        expect(await FormsPage.isDisplayed()).toBe(true);
    });

    it('Cenário 7: Digitação de texto e validação do feedback em tempo real', async () => {
        const textToEnter = 'Carrefour Banco Mobile Automation Test';
        await FormsPage.enterText(textToEnter);
        
        const result = await FormsPage.getInputResultText();
        expect(result).toBe(textToEnter);
    });

    it('Cenário 8: Toggle do Switch e seleção de valor no Dropdown/Picker', async () => {
        // Valida o comportamento do Switch (Toggle)
        const initialStatusText = await FormsPage.getSwitchStatusText();
        
        await FormsPage.toggleSwitch();
        
        const updatedStatusText = await FormsPage.getSwitchStatusText();
        expect(initialStatusText).not.toBe(updatedStatusText);
        
        // Seleciona uma opção no Dropdown/Picker
        const option = 'Appium is awesome';
        await FormsPage.selectDropdownOption(option);
    });

    it('Cenário 9: Botão ativo exibe alerta e botão inativo está desabilitado', async () => {
        // Valida que o botão inativo está desabilitado
        const isInactiveDisabled = await FormsPage.isInactiveButtonDisabled();
        expect(isInactiveDisabled).toBe(true);

        // Clica no botão ativo e valida a exibição do alerta nativo
        await FormsPage.clickActiveButton();
        
        await browser.waitUntil(async () => await browser.isAlertOpen(), {
            timeout: 10000,
            timeoutMsg: 'Alerta de botão ativo não apareceu'
        });
        
        const alertText = await browser.getAlertText();
        expect(alertText).toContain('This button is active');
        
        await browser.acceptAlert();
    });
});
