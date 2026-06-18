import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:47120';
const shots = [];

const shot = async (page, name) => {
  const path = `c:\\Users\\fabri\\OneDrive\\Documentos\\Estudios\\UTN 2°\\Metologia\\Activia-trace\\verify_${name}.png`;
  await page.screenshot({ path, fullPage: false });
  shots.push({ name, path });
  console.log(`[screenshot] ${name}`);
};

const login = async (page, email, password) => {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.includes('/login'), { timeout: 8000 });
  console.log(`[login] as ${email} → ${page.url()}`);
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  page.on('console', m => { if (m.type() === 'error') console.log('[console.error]', m.text()); });

  try {
    // ── STEP 1: COORDINADOR → sidebar shows "Equipos Docentes" ────────────────
    console.log('\n=== Step 1: COORDINADOR sidebar ===');
    await login(page, 'coord@activia.edu.ar', 'password123');
    await shot(page, '01_coord_dashboard');

    const equiposLink = page.locator('text=Equipos Docentes');
    const linkCount = await equiposLink.count();
    console.log(`[check] "Equipos Docentes" in sidebar: ${linkCount > 0 ? 'FOUND' : 'NOT FOUND'}`);
    await shot(page, '02_coord_sidebar');

    // ── STEP 2: Navigate to /admin/equipos ────────────────────────────────────
    console.log('\n=== Step 2: GestionEquiposPage ===');
    await page.goto(`${BASE}/admin/equipos`);
    await page.waitForLoadState('networkidle');
    await shot(page, '03_gestion_equipos_empty');

    const selector = await page.locator('select').count();
    console.log(`[check] Materia selector present: ${selector > 0 ? 'YES' : 'NO'}`);

    const emptyState = await page.locator('text=Seleccioná una materia').count();
    console.log(`[check] Empty state text present: ${emptyState > 0 ? 'YES' : 'NO'}`);

    // ── STEP 3: Select a materia ──────────────────────────────────────────────
    console.log('\n=== Step 3: Select materia ===');
    const options = await page.locator('select option').allTextContents();
    console.log(`[check] Materia options: ${options.join(', ')}`);

    const nonEmpty = options.filter(o => o.trim() && !o.includes('Seleccioná'));
    if (nonEmpty.length > 0) {
      await page.selectOption('select', { label: nonEmpty[0] });
      await page.waitForTimeout(1500);
      await shot(page, '04_gestion_equipos_materia_selected');

      const equiposPanel = await page.locator('text=Equipos Docentes').first();
      const panelVisible = await equiposPanel.isVisible().catch(() => false);
      console.log(`[check] EquiposPanel visible after selection: ${panelVisible ? 'YES' : 'NO'}`);

      // ── STEP 4: Clone button ────────────────────────────────────────────────
      console.log('\n=== Step 4: Clone button ===');
      const cloneBtn = page.locator('button:has-text("Clonar equipo")');
      const cloneBtnVisible = await cloneBtn.isVisible().catch(() => false);
      console.log(`[check] "Clonar equipo" button: ${cloneBtnVisible ? 'VISIBLE' : 'NOT VISIBLE'}`);

      if (cloneBtnVisible) {
        await cloneBtn.click();
        await page.waitForTimeout(500);
        const modal = await page.locator('text=Clonar Equipo Docente').count();
        console.log(`[check] CloneAsignacionesModal opened: ${modal > 0 ? 'YES' : 'NO'}`);
        await shot(page, '05_clone_modal');
        await page.keyboard.press('Escape');
      }
    } else {
      console.log('[warn] No materias in DB to select');
    }

    // ── STEP 5: Query param pre-selection ────────────────────────────────────
    console.log('\n=== Step 5: Query param ?materia= ===');
    if (nonEmpty.length > 0) {
      // Get materia id from DOM option value
      const firstOptionValue = await page.locator('select option').nth(1).getAttribute('value');
      console.log(`[check] First materia id: ${firstOptionValue}`);
      await page.goto(`${BASE}/admin/equipos?materia=${firstOptionValue}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const selectedVal = await page.locator('select').inputValue();
      console.log(`[check] Select value after ?materia= param: ${selectedVal} (expected ${firstOptionValue})`);
      const paramPreselect = selectedVal === firstOptionValue;
      console.log(`[check] Pre-selection via query param: ${paramPreselect ? 'PASS' : 'FAIL'}`);
      await shot(page, '06_query_param_preselect');
    }

    // ── STEP 6: MateriasPage "Ver equipo" button ──────────────────────────────
    console.log('\n=== Step 6: MateriasPage "Ver equipo" button ===');
    await page.goto(`${BASE}/admin/materias`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await shot(page, '07_materias_page');

    const verEquipoBtn = page.locator('button:has-text("Ver equipo")').first();
    const verEquipoBtnVisible = await verEquipoBtn.isVisible().catch(() => false);
    console.log(`[check] "Ver equipo" button in MateriasPage: ${verEquipoBtnVisible ? 'FOUND' : 'NOT FOUND'}`);

    if (verEquipoBtnVisible) {
      await verEquipoBtn.click();
      await page.waitForURL(url => url.includes('/admin/equipos?materia='), { timeout: 5000 });
      const urlAfter = page.url();
      console.log(`[check] Navigated to: ${urlAfter}`);
      const hasQueryParam = urlAfter.includes('/admin/equipos?materia=');
      console.log(`[check] URL contains ?materia=: ${hasQueryParam ? 'PASS' : 'FAIL'}`);
      await page.waitForTimeout(1000);
      await shot(page, '08_after_ver_equipo_click');
    }

    // ── STEP 7: PROFESOR → sidebar shows "Mis Equipos" ───────────────────────
    console.log('\n=== Step 7: PROFESOR sidebar ===');
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    // logout if needed - just clear and login again
    await page.fill('input[type="email"], input[name="email"]', 'profesor@activia.edu.ar');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.includes('/login'), { timeout: 8000 });
    await page.waitForTimeout(1000);
    await shot(page, '09_profesor_dashboard');

    const misEquiposLink = page.locator('text=Mis Equipos');
    const misEquiposCount = await misEquiposLink.count();
    console.log(`[check] "Mis Equipos" in sidebar for PROFESOR: ${misEquiposCount > 0 ? 'FOUND' : 'NOT FOUND'}`);

    // ── STEP 8: MisEquiposPage ────────────────────────────────────────────────
    console.log('\n=== Step 8: MisEquiposPage ===');
    await page.goto(`${BASE}/mis-equipos`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, '10_mis_equipos_page');

    const tableOrEmpty = await page.locator('table, text=No tenés asignaciones').count();
    console.log(`[check] MisEquiposPage shows table or empty state: ${tableOrEmpty > 0 ? 'YES' : 'NO'}`);

    // ── STEP 9: PROBE — navigate to /admin/equipos as PROFESOR ───────────────
    console.log('\n=== Step 9 (probe): PROFESOR accesses /admin/equipos ===');
    await page.goto(`${BASE}/admin/equipos`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await shot(page, '11_profesor_at_admin_equipos');
    const probeUrl = page.url();
    console.log(`[probe] PROFESOR at /admin/equipos → landed at: ${probeUrl}`);

  } catch (err) {
    console.error('[ERROR]', err.message);
    await shot(page, 'error_state');
  } finally {
    await browser.close();
    console.log('\n=== Screenshots ===');
    shots.forEach(s => console.log(`  ${s.name}: ${s.path}`));
  }
})();
