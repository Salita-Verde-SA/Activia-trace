import { chromium } from 'playwright';

const BASE = 'http://localhost:47120';
const shots = [];

const shot = async (page, name) => {
  const path = `C:\\Users\\fabri\\OneDrive\\Documentos\\Estudios\\UTN 2°\\Metologia\\Activia-trace\\verify_${name}.png`;
  await page.screenshot({ path, fullPage: false });
  shots.push({ name, path });
  console.log(`[screenshot] ${name}`);
};

const login = async (page, email, password) => {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
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

    const equiposLink = await page.locator('text=Equipos Docentes').count();
    console.log(`[check] "Equipos Docentes" in sidebar: ${equiposLink > 0 ? 'FOUND' : 'NOT FOUND'}`);
    await shot(page, '02_coord_sidebar');

    // ── STEP 2: Navigate to /admin/equipos ────────────────────────────────────
    console.log('\n=== Step 2: GestionEquiposPage ===');
    await page.goto(`${BASE}/admin/equipos`);
    await page.waitForTimeout(2000);
    await shot(page, '03_gestion_equipos_empty');

    const selectorCount = await page.locator('select').count();
    console.log(`[check] Materia selector present: ${selectorCount > 0 ? 'YES' : 'NO'}`);

    const emptyState = await page.locator('text=Seleccioná una materia').count();
    console.log(`[check] Empty state text present: ${emptyState > 0 ? 'YES' : 'NO'}`);

    // ── STEP 3: Select a materia ──────────────────────────────────────────────
    console.log('\n=== Step 3: Select materia ===');
    const options = await page.locator('select option').allTextContents();
    console.log(`[check] Materia options: ${options.join(' | ')}`);

    const nonEmpty = options.filter(o => o.trim() && !o.includes('Seleccioná'));
    if (nonEmpty.length > 0) {
      // Get value of first non-empty option
      const firstOptionValue = await page.locator('select option').nth(1).getAttribute('value');
      console.log(`[check] Selecting materia id: ${firstOptionValue}`);

      await page.selectOption('select', { index: 1 });
      await page.waitForTimeout(2000);
      await shot(page, '04_gestion_equipos_materia_selected');

      const panelHeader = await page.locator('text=Equipos Docentes').count();
      console.log(`[check] EquiposPanel visible after selection: ${panelHeader > 0 ? 'YES' : 'NO'}`);

      // ── STEP 4: Clone button ────────────────────────────────────────────────
      console.log('\n=== Step 4: Clone button ===');
      const cloneBtn = page.locator('button:has-text("Clonar equipo")');
      const cloneBtnVisible = await cloneBtn.isVisible().catch(() => false);
      console.log(`[check] "Clonar equipo" button: ${cloneBtnVisible ? 'VISIBLE' : 'NOT VISIBLE'}`);

      if (cloneBtnVisible) {
        await cloneBtn.click();
        await page.waitForTimeout(800);
        const modal = await page.locator('text=Clonar Equipo Docente').count();
        console.log(`[check] CloneAsignacionesModal opened: ${modal > 0 ? 'YES' : 'NO'}`);
        await shot(page, '05_clone_modal');
        await page.locator('button:has-text("Cancelar")').click();
        await page.waitForTimeout(500);
      }

      // ── STEP 5: Query param pre-selection ──────────────────────────────────
      console.log('\n=== Step 5: Query param ?materia= ===');
      await page.goto(`${BASE}/admin/equipos?materia=${firstOptionValue}`);
      await page.waitForTimeout(2000);
      const selectedVal = await page.locator('select').inputValue();
      console.log(`[check] Select value after ?materia= param: "${selectedVal}" (expected "${firstOptionValue}")`);
      console.log(`[check] Pre-selection via query param: ${selectedVal === firstOptionValue ? 'PASS' : 'FAIL'}`);
      await shot(page, '06_query_param_preselect');
    } else {
      console.log('[warn] No materias in DB to select');
    }

    // ── STEP 6: MateriasPage "Ver equipo" button ──────────────────────────────
    console.log('\n=== Step 6: MateriasPage "Ver equipo" button ===');
    await page.goto(`${BASE}/admin/materias`);
    await page.waitForTimeout(2000);
    await shot(page, '07_materias_page');

    const verEquipoBtn = page.locator('button:has-text("Ver equipo")').first();
    const verEquipoBtnVisible = await verEquipoBtn.isVisible().catch(() => false);
    console.log(`[check] "Ver equipo" button in MateriasPage: ${verEquipoBtnVisible ? 'FOUND' : 'NOT FOUND'}`);

    if (verEquipoBtnVisible) {
      await verEquipoBtn.click();
      await page.waitForTimeout(2000);
      const urlAfter = page.url();
      console.log(`[check] Navigated to: ${urlAfter}`);
      const hasQueryParam = urlAfter.includes('/admin/equipos?materia=') || urlAfter.includes('/admin/equipos%3Fmateria=');
      console.log(`[check] URL contains /admin/equipos?materia=: ${hasQueryParam ? 'PASS' : 'FAIL'}`);
      await shot(page, '08_after_ver_equipo_click');
    }

    // ── STEP 7: PROFESOR → "Mis Equipos" in sidebar ──────────────────────────
    console.log('\n=== Step 7: PROFESOR sidebar ===');
    await page.goto(`${BASE}/login`);
    await page.waitForTimeout(1000);
    await page.fill('input[type="email"], input[name="email"]', 'profesor@activia.edu.ar');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await shot(page, '09_profesor_dashboard');

    const misEquiposCount = await page.locator('text=Mis Equipos').count();
    console.log(`[check] "Mis Equipos" in sidebar for PROFESOR: ${misEquiposCount > 0 ? 'FOUND' : 'NOT FOUND'}`);

    // ── STEP 8: MisEquiposPage ────────────────────────────────────────────────
    console.log('\n=== Step 8: MisEquiposPage ===');
    await page.goto(`${BASE}/mis-equipos`);
    await page.waitForTimeout(2000);
    await shot(page, '10_mis_equipos_page');

    const tableOrEmpty = await page.locator('table, text=No tenés asignaciones').count();
    console.log(`[check] MisEquiposPage shows table or empty state: ${tableOrEmpty > 0 ? 'YES' : 'NO'}`);

    // ── STEP 9 (probe): PROFESOR at /admin/equipos ───────────────────────────
    console.log('\n=== Step 9 (probe): PROFESOR accesses /admin/equipos ===');
    await page.goto(`${BASE}/admin/equipos`);
    await page.waitForTimeout(2000);
    await shot(page, '11_profesor_at_admin_equipos');
    const probeUrl = page.url();
    console.log(`[probe] PROFESOR at /admin/equipos → landed at: ${probeUrl}`);
    // Note: no auth guard on this route yet, just observing behavior

  } catch (err) {
    console.error('[ERROR]', err.message);
    await page.screenshot({ path: 'C:\\Users\\fabri\\OneDrive\\Documentos\\Estudios\\UTN 2°\\Metologia\\Activia-trace\\verify_error.png' }).catch(() => {});
  } finally {
    await browser.close();
    console.log('\n=== Screenshots saved ===');
    shots.forEach(s => console.log(`  ${s.name}`));
  }
})();
