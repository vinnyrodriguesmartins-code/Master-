import HomePage from '../pageobjects/home.page.js';
import SwipePage from '../pageobjects/swipe.page.js';

describe('Desafio Mobile: Gestos de Swipe e Scroll', () => {
    beforeEach(async () => {
        // Navega até a tela de Swipe antes de cada teste
        await HomePage.openSwipe();
        expect(await SwipePage.isDisplayed()).toBe(true);
    });

    it('Cenário 10: Swipes horizontais no carrossel e scroll vertical até encontrar elemento oculto', async () => {
        // 1. Realiza swipes horizontais para navegar pelos cards do carrossel (Ex. "FULLY OPEN SOURCE", "GREAT COMMUNITY")
        await SwipePage.swipeLeft();
        await SwipePage.swipeLeft();
        await SwipePage.swipeRight();
        
        // 2. Realiza scroll vertical para baixo até encontrar o elemento oculto "You found me!"
        await SwipePage.scrollToHiddenElement();
        
        // Valida se o texto oculto está visível e correto
        const text = await SwipePage.getHiddenElementText();
        expect(text).toBe('You found me!');
    });
});
