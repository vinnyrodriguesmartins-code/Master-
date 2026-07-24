import BasePage from './base.page.js';

class HomePage extends BasePage {
    // Tela Home e elementos principais
    get homeScreen() { return $('~Home-screen'); }
    
    // Verifica se a tela Home está visível
    async isDisplayed() {
        return await this.homeScreen.waitForDisplayed({ timeout: 10000 });
    }
}

export default new HomePage();
