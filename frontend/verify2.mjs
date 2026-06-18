import { chromium } from 'playwright';

const BASE = 'http://localhost:47120';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // login as PROFESOR
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"], input[name="email"]', 'profesor@activia.edu.ar');
  await page.fill('input[type="password"], input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('PROFESOR logged in at:', page.url());

  // go to mis-equipos
  await page.goto(`${BASE}/mis-equipos`);
  await page.waitForTimeout(2500);

  const path = 'C:\\Users\\fabri\\OneDrive\\Documentos\\Estudios\\UTN 2°\\Metologia\\Activia-trace\\verify_mis_equipos.png';
  await page.screenshot({ path, fullPage: true });
  console.log('screenshot: verify_mis_equipos.png');

  // check what's visible
  const hasTable = await page.locator('table').count();
  const emptyStateText = await page.locator('text=No tenés asignaciones').count();
  const errorText = await page.locator('text=Error').count();
  const h1Text = await page.locator('h1').textContent().catch(() => '?');

  console.log(`h1: "${h1Text}"`);
  console.log(`table present: ${hasTable}`);
  console.log(`empty state text: ${emptyStateText}`);
  console.log(`error text: ${errorText}`);

  // check table rows if any
  if (hasTable > 0) {
    const rows = await page.locator('tbody tr').count();
    console.log(`table rows: ${rows}`);
    // first row content
    if (rows > 0) {
      const firstRow = await page.locator('tbody tr').first().textContent();
      console.log(`first row: "${firstRow?.trim()}"`);
    }
  }

  // check sidebar items visible for PROFESOR
  const sidebarLinks = await page.locator('nav a, nav span').allTextContents();
  const relevantLinks = sidebarLinks.filter(t => ['Mis Equipos', 'Equipos Docentes', 'Calificaciones'].includes(t.trim()));
  console.log('Relevant sidebar items:', relevantLinks);

  await browser.close();
})();
