import HomePage from '../pageobjects/home.page.js';
import FormsPage from '../pageobjects/forms.page.js';

describe('Desafio Mobile: Preenchimento de Formulários', () => {
    beforeEach(async () => {
        // Navega até a tela de Forms antes de cada cenário
        await HomePage.openForms();
        expect(await FormsPage.isDisplayed()).toBe(true);
    });


    it('Cenário 7: Digitação de texto e validação do feedback em tempo real', async () => {
        const textToEnter = 'Carrefour Banco Mobile Test';
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
        
        let alertText = '';
        if (driver.isAndroid) {
            const alertTitleEl = $('android=new UiSelector().resourceId("android:id/alertTitle")');
            const alertMsgEl = $('android=new UiSelector().resourceId("android:id/message")');
            const okBtnEl = $('android=new UiSelector().resourceId("android:id/button1")');

            await alertMsgEl.waitForDisplayed({ timeout: 10000 });
            
            let titleText = '';
            try {
                if (await alertTitleEl.isExisting()) {
                    titleText = await alertTitleEl.getText();
                }
            } catch (e) {}
            
            const message = await alertMsgEl.getText();
            alertText = titleText ? `${titleText} ${message}` : message;
            await okBtnEl.click();
        } else {
            await browser.waitUntil(async () => {
                try {
                    await browser.getAlertText();
                    return true;
                } catch (err) {
                    return false;
                }
            }, {
                timeout: 10000,
                timeoutMsg: 'Alerta de botão ativo não apareceu'
            });
            alertText = await browser.getAlertText();
            await browser.acceptAlert();
        }
        
        expect(alertText).toContain('This button is active');
    });
});
