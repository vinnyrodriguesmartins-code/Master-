import BasePage from './base.page.js';

class FormsPage extends BasePage {
    // Elementos da tela de formulário
    get formsScreen() { return $('~Forms-screen'); }
    get textInput() { return $('~text-input'); }
    get inputTextResult() { return $('~input-text-result'); }
    
    get switchButton() { return $('~switch'); }
    get switchText() { return $('~switch-text'); }
    
    get dropdown() { return $('~select-Dropdown'); }
    get activeBtn() { return $('~button-Active'); }
    get inactiveBtn() { return $('~button-Inactive'); }

    // Verifica se a tela Forms está visível
    async isDisplayed() {
        return await this.formsScreen.waitForDisplayed({ timeout: 10000 });
    }

    // Digita texto no campo de texto
    async enterText(text) {
        await this.setValue(this.textInput, text);
    }

    // Retorna o texto digitado exibido como resultado
    async getInputResultText() {
        return await this.getText(this.inputTextResult);
    }

    // Alterna o estado do Switch
    async toggleSwitch() {
        await this.clickElement(this.switchButton);
    }

    // Retorna o status de texto do Switch
    async getSwitchStatusText() {
        return await this.getText(this.switchText);
    }

    // Seleciona uma opção no dropdown picker
    async selectDropdownOption(optionText) {
        await this.clickElement(this.dropdown);
        
        if (driver.isAndroid) {
            // No Android, as opções aparecem em uma lista de opções
            const option = await $(`//*[@text="${optionText}"]`);
            await option.waitForDisplayed({ timeout: 5000 });
            await option.click();
        } else {
            // No iOS, se for exibido como lista ou picker wheel
            const option = await $(`-ios predicate string:label == "${optionText}"`);
            if (await option.isDisplayed()) {
                await option.click();
            } else {
                const picker = await $('//XCUIElementTypePickerWheel');
                await picker.waitForDisplayed({ timeout: 5000 });
                await picker.setValue(optionText);
                
                // Clica fora para fechar se necessário
                await this.formsScreen.click();
            }
        }
    }

    // Clica no botão ativo
    async clickActiveButton() {
        await this.clickElement(this.activeBtn);
    }

    // Verifica se o botão inativo está desabilitado/não clicável
    async isInactiveButtonDisabled() {
        await this.inactiveBtn.waitForDisplayed({ timeout: 5000 });
        // Retorna o atributo enabled (para Android e iOS)
        const isEnabled = await this.inactiveBtn.isEnabled();
        return !isEnabled;
    }
}

export default new FormsPage();
