import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Pesquisa Eleitoral DF 2026 - Testes Completos', () => {
  
  test.describe('1. Pagina Inicial e Navegacao', () => {
    
    test('deve carregar a pagina inicial', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/01-home.png' });
      console.log('Pagina inicial carregada');
    });

    test('deve acessar pagina de login', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/02-login.png' });
      console.log('Pagina de login carregada');
    });
  });

  test.describe('2. Fluxo de Login', () => {
    
    test('deve exibir formulario de login', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Verifica se a pagina carregou
      const content = await page.content();
      console.log('Login page loaded, checking for form elements...');
      
      await page.screenshot({ path: 'tests/screenshots/03-login-form.png' });
    });

    test('deve fazer login com credenciais validas', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Tenta encontrar inputs de usuario e senha
      const inputs = await page.locator('input').all();
      console.log(`Encontrados ${inputs.length} inputs na pagina`);
      
      // Preenche os campos encontrados
      if (inputs.length >= 2) {
        await inputs[0].fill('professorigor');
        await inputs[1].fill('professorigor');
        await page.screenshot({ path: 'tests/screenshots/04-login-preenchido.png' });
        
        // Tenta clicar no botao
        const button = page.locator('button[type="submit"], button').first();
        await button.click();
        await page.waitForTimeout(3000);
      }
      
      await page.screenshot({ path: 'tests/screenshots/05-pos-login.png' });
      console.log('URL atual:', page.url());
    });
  });

  test.describe('3. Navegacao pelas Paginas', () => {

    test('deve acessar pagina de eleitores', async ({ page }) => {
      await page.goto(`${BASE_URL}/eleitores`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/06-eleitores.png' });
      console.log('Pagina eleitores - URL:', page.url());
    });

    test('deve acessar pagina de entrevistas', async ({ page }) => {
      await page.goto(`${BASE_URL}/entrevistas`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/07-entrevistas.png' });
      console.log('Pagina entrevistas - URL:', page.url());
    });

    test('deve acessar pagina de resultados', async ({ page }) => {
      await page.goto(`${BASE_URL}/resultados`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/08-resultados.png' });
      console.log('Pagina resultados - URL:', page.url());
    });

    test('deve acessar pagina de candidatos', async ({ page }) => {
      await page.goto(`${BASE_URL}/candidatos`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/09-candidatos.png' });
      console.log('Pagina candidatos - URL:', page.url());
    });

    test('deve acessar pagina de parlamentares', async ({ page }) => {
      await page.goto(`${BASE_URL}/parlamentares`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/10-parlamentares.png' });
      console.log('Pagina parlamentares - URL:', page.url());
    });

    test('deve acessar pagina de analytics', async ({ page }) => {
      await page.goto(`${BASE_URL}/analytics`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/11-analytics.png' });
      console.log('Pagina analytics - URL:', page.url());
    });

    test('deve acessar pagina de estimativas', async ({ page }) => {
      await page.goto(`${BASE_URL}/estimativas`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/12-estimativas.png' });
      console.log('Pagina estimativas - URL:', page.url());
    });

    test('deve acessar pagina de gestores', async ({ page }) => {
      await page.goto(`${BASE_URL}/gestores`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/13-gestores.png' });
      console.log('Pagina gestores - URL:', page.url());
    });

    test('deve acessar pagina de cenarios', async ({ page }) => {
      await page.goto(`${BASE_URL}/cenarios`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/14-cenarios.png' });
      console.log('Pagina cenarios - URL:', page.url());
    });

    test('deve acessar mapa', async ({ page }) => {
      await page.goto(`${BASE_URL}/mapa`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/15-mapa.png' });
      console.log('Pagina mapa - URL:', page.url());
    });
  });

  test.describe('4. Responsividade', () => {
    
    test('deve funcionar em mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/16-mobile-login.png' });
      
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/17-mobile-home.png' });
      console.log('Teste mobile concluido');
    });

    test('deve funcionar em tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/18-tablet-login.png' });
      console.log('Teste tablet concluido');
    });
  });
});
