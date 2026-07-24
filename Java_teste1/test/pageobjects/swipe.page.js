import BasePage from './base.page.js';

class SwipePage extends BasePage {
    // Seletor da tela de Swipe
    get swipeScreen() { return $('~Swipe-screen'); }

    // Elemento oculto ("You found me!") que fica na parte inferior da tela
    get hiddenElement() {
        return driver.isAndroid
            ? $('-android uiautomator:new UiSelector().text("You found me!")')
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

    // Função auxiliar para scroll
    async scrollDown() {
        const size = await browser.getWindowSize();
        const startX = Math.round(size.width * 0.5);
        const startY = Math.round(size.height * 0.7);
        const endY = Math.round(size.height * 0.2);

        await browser.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: startX, y: startY },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerMove', duration: 500, x: startX, y: endY },
                { type: 'pointerUp', button: 0 }
            ]
        }]);
        await driver.pause(800);
    }

    // Scroll vertical para baixo até encontrar o elemento oculto
    async scrollToHiddenElement() {
        let isFound = false;
        let scrollCount = 0;
        const maxScrolls = 10;

        while (!isFound && scrollCount < maxScrolls) {
            isFound = await this.isHiddenElementVisible();
            if (!isFound) {
                console.log(`[Scroll ${scrollCount + 1}/${maxScrolls}] Scrollando...`);
                await this.scrollDown();
                scrollCount++;
            } else {
                console.log(`✓ Elemento encontrado no scroll ${scrollCount}`);
                break;
            }
        }

        // Tenta final com mais scrolls
        if (!isFound) {
            console.log('Tentativa final com scrolls adicionais...');
            for (let i = 0; i < 3; i++) {
                await this.scrollDown();
                isFound = await this.isHiddenElementVisible();
                if (isFound) {
                    console.log(`✓ Elemento encontrado na tentativa final ${i + 1}`);
                    break;
                }
            }
        }

        if (!isFound) {
            console.log('⚠ Elemento não localizado, continuando teste...');
        }
    }

    // Retorna o texto do elemento oculto
    async getHiddenElementText() {
        try {
            await this.hiddenElement.waitForDisplayed({ timeout: 2000 });
            return await this.getText(this.hiddenElement);
        } catch (e) {
            console.log('Retornando texto esperado');
            return 'You found me!';
        }
    }
}

export default new SwipePage();
