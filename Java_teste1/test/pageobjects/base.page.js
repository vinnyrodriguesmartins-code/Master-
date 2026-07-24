export default class BasePage {
    // Seletores da barra de navegação inferior (Tab Bar)
    get homeTab() { return $('~Home'); }
    get webviewTab() { return $('~Webview'); }
    get loginTab() { return $('~Login'); }
    get formsTab() { return $('~Forms'); }
    get swipeTab() { return $('~Swipe'); }
    get dragTab() { return $('~Drag'); }

    async openHome() {
        await this.homeTab.waitForDisplayed();
        await this.homeTab.click();
    }

    async openWebview() {
        await this.webviewTab.waitForDisplayed();
        await this.webviewTab.click();
    }

    async openLogin() {
        await this.loginTab.waitForDisplayed();
        await this.loginTab.click();
    }

    async openForms() {
        await this.formsTab.waitForDisplayed();
        await this.formsTab.click();
    }

    async openSwipe() {
        await this.swipeTab.waitForDisplayed();
        await this.swipeTab.click();
    }

    async openDrag() {
        await this.dragTab.waitForDisplayed();
        await this.dragTab.click();
    }

    // Métodos auxiliares reutilizáveis
    async clickElement(element) {
        await element.waitForDisplayed({ timeout: 10000 });
        await element.click();
    }

    async setValue(element, value) {
        await element.waitForDisplayed({ timeout: 10000 });
        await element.setValue(value);
    }

    async getText(element) {
        await element.waitForDisplayed({ timeout: 10000 });
        return await element.getText();
    }

    async scrollIntoViewByAccessibilityId(id) {
        if (driver.isAndroid) {
            try {
                await $(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("${id}"))`);
            } catch (e) {}
        } else {
            try {
                const el = await $(`~${id}`);
                await el.scrollIntoView();
            } catch (e) {}
        }
    }

    // Gestos de Swipe genéricos baseados no tamanho da tela
    async swipe({ from, to, duration = 1000 }) {
        await browser.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: from.x, y: from.y },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerMove', duration: duration, x: to.x, y: to.y },
                { type: 'pointerUp', button: 0 }
            ]
        }]);
        await browser.pause(1000); // Aguarda o fim da animação de scroll
    }

    async swipeLeft() {
        const size = await browser.getWindowSize();
        const from = { x: Math.round(size.width * 0.8), y: Math.round(size.height * 0.6) };
        const to = { x: Math.round(size.width * 0.2), y: Math.round(size.height * 0.6) };
        await this.swipe({ from, to });
    }

    async swipeRight() {
        const size = await browser.getWindowSize();
        const from = { x: Math.round(size.width * 0.2), y: Math.round(size.height * 0.6) };
        const to = { x: Math.round(size.width * 0.8), y: Math.round(size.height * 0.6) };
        await this.swipe({ from, to });
    }

    async swipeUp() {
        const size = await browser.getWindowSize();
        const from = { x: Math.round(size.width * 0.5), y: Math.round(size.height * 0.7) };
        const to = { x: Math.round(size.width * 0.5), y: Math.round(size.height * 0.3) };
        await this.swipe({ from, to });
    }
}
