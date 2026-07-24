import BasePage from './base.page.js';

class LoginPage extends BasePage {
    // Abas de navegação interna da tela de Login
    get loginTabButton() { return $('~button-login-container'); }
    get signUpTabButton() { return $('~button-sign-up-container'); }

    // Campos de input
    get emailInput() { return $('~input-email'); }
    get passwordInput() { return $('~input-password'); }
    get confirmPasswordInput() { return $('~input-repeat-password'); }

    // Botões de ação
    get loginSubmitButton() { return $('~button-LOGIN'); }
    get signUpSubmitButton() { return $('~button-SIGN UP'); }

    // Métodos para alternar abas
    async switchTologinTab() {
        await this.clickElement(this.loginTabButton);
    }

    async switchToSignUpTab() {
        await this.clickElement(this.signUpTabButton);
    }

    // Métodos de envio de formulário
    async login(email, password) {
        await this.setValue(this.emailInput, email);
        await this.setValue(this.passwordInput, password);
        if (driver.isAndroid) {
            try {
                await driver.hideKeyboard();
            } catch (e) {}
        }
        await this.clickElement(this.loginSubmitButton);
    }

    async signUp(email, password, confirmPassword) {
        await this.setValue(this.emailInput, email);
        await this.setValue(this.passwordInput, password);
        await this.setValue(this.confirmPasswordInput, confirmPassword);
        if (driver.isAndroid) {
            try {
                await driver.hideKeyboard();
            } catch (e) {}
        }
        await this.clickElement(this.signUpSubmitButton);
    }

    // Retorna elemento de erro de validação com base no texto esperado (Multi-plataforma)
    async getValidationErrorElement(text) {
        const selector = driver.isAndroid
            ? `android=new UiSelector().text("${text}")`
            : `-ios predicate string:label == "${text}"`;
        return $(selector);
    }

    // Verifica se um erro de validação específico está visível
    async isValidationErrorVisible(text) {
        const el = await this.getValidationErrorElement(text);
        return await el.waitForDisplayed({ timeout: 5000 });
    }

    // Captura e aceita alertas nativos (ex. de sucesso)
    async handleNativeAlert() {
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
                timeoutMsg: 'Alerta nativo não apareceu'
            });
            alertText = await browser.getAlertText();
            await browser.acceptAlert();
        }
        return alertText;
    }
}

export default new LoginPage();
