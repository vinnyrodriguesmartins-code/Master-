import BasePage from './base.page.js';

class SwipePage extends BasePage {
    // Seletor da tela de Swipe
    get swipeScreen() { return $('~Swipe-screen'); }

    // Elemento oculto ("You found me!") que fica na parte inferior da tela
    get hiddenElement() {
        return driver.isAndroid
            ? $('android=new UiSelector().text("You found me!")')
            : $('~You found me!');
    }

    // Elementos do carrossel/cards
    get cardTitle() {
        // Encontra o título ativo no carrossel de acordo com a visibilidade
        return driver.isAndroid
            ? $('android=new UiSelector().textContains("GREAT COMMUNITY")') // Exemplo de texto de card
            : $('~GREAT COMMUNITY');
    }

    // Verifica se a tela Swipe está visível
    async isDisplayed() {
        return await this.swipeScreen.waitForDisplayed({ timeout: 10000 });
    }

    // Verifica se o elemento oculto está visível na viewport atual
    async isHiddenElementVisible() {
        try {
            return await this.hiddenElement.isDisplayed();
        } catch (e) {
            return false;
        }
    }

    // Scroll vertical para baixo até encontrar o elemento oculto
    async scrollToHiddenElement() {
        let isFound = false;
        let maxScrolls = 6;

        while (!isFound && maxScrolls > 0) {
            isFound = await this.isHiddenElementVisible();
            if (!isFound) {
                await this.swipeUp();
                maxScrolls--;
            }
        }

        if (!isFound) {
            throw new Error('Elemento "You found me!" não foi localizado após vários scrolls.');
        }
    }

    // Retorna o texto do elemento oculto
    async getHiddenElementText() {
        await this.hiddenElement.waitForDisplayed({ timeout: 5000 });
        return await this.getText(this.hiddenElement);
    }
}

export default new SwipePage();
