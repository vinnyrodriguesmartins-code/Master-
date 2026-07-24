import HomePage from '../pageobjects/home.page.js';
import LoginPage from '../pageobjects/login.page.js';
import FormsPage from '../pageobjects/forms.page.js';
import SwipePage from '../pageobjects/swipe.page.js';

describe('Desafio Mobile: Navegação entre Telas', () => {
    it('Cenário 6: Navegação completa pela barra inferior (Tab Bar)', async () => {
        // 1. Inicia na Home e valida visibilidade
        await HomePage.openHome();
        expect(await HomePage.isDisplayed()).toBe(true);

        // 2. Navega para Login e valida visibilidade
        await HomePage.openLogin();
        expect(await LoginPage.loginTabButton.isDisplayed()).toBe(true);

        // 3. Navega para Forms e valida visibilidade
        await LoginPage.openForms();
        expect(await FormsPage.isDisplayed()).toBe(true);

        // 4. Navega para Swipe e valida visibilidade
        await FormsPage.openSwipe();
        expect(await SwipePage.isDisplayed()).toBe(true);

        // 5. Navega para Drag e valida visibilidade
        await SwipePage.openDrag();
        const dragScreen = $('~Drag-drop-screen');
        expect(await dragScreen.waitForDisplayed({ timeout: 5000 })).toBe(true);

        // 6. Retorna para Home
        await SwipePage.openHome();
        expect(await HomePage.isDisplayed()).toBe(true);
    });
});
