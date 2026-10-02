import { test, expect } from '@playwright/test'

test('Read, search, bookmark, navigate and restore preferences', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'El Fatiha', exact: true })).toBeVisible()
  await expect(page.locator('.ayah-card')).toHaveCount(7)
  await expect(page.locator('.arabic-text .quran-text').first()).toHaveAttribute(
    'aria-label',
    /بِسْمِ/,
  )
  await expect(page.locator('.arabic-text .qcf-v2').first()).toBeVisible()
  expect(
    await page
      .locator('.arabic-text .qcf-word')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain('QCF2-1')
  await expect(page.locator('.inline-tafsir')).toHaveCount(0)
  await page.getByRole('button', { name: 'Shfaq tefsirin e ajetit 1:1', exact: true }).click()
  await expect(page.locator('.inline-tafsir .document-text strong').first()).toContainText('Bismil')
  expect(
    await page
      .locator('.document-text strong')
      .first()
      .evaluate((el) => getComputedStyle(el).fontWeight),
  ).toBe('700')
  await page.evaluate(() => document.fonts.ready)
  expect(
    await page
      .locator('.arabic-text')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain('KFGQPC Hafs')
  expect(await page.evaluate(() => document.fonts.check('30px "KFGQPC Hafs"'))).toBe(true)
  await page.getByRole('button', { name: 'Ruaj ajetin 1:1', exact: true }).click()
  await page.getByRole('tab', { name: 'Të ruajturat' }).click()
  await expect(page.locator('.saved-item')).toHaveCount(1)
  await page.getByRole('button', { name: 'Kërko në Kuran', exact: false }).first().click()
  await page.getByRole('textbox', { name: 'Kërkimi në Kuran' }).fill('2:255')
  await expect(page.locator('.search-result')).toHaveCount(1)
  await page.locator('.search-result').click()
  await expect(page.getByRole('heading', { name: 'El Bekare', exact: true })).toBeVisible()
  await expect(page.locator('#ayah-255')).toBeVisible()
  await page.getByRole('button', { name: 'Preferencat', exact: true }).click()
  await page.getByRole('button', { name: 'E errët', exact: true }).click()
  await page.getByRole('button', { name: 'Zmadho tekstin arabisht' }).click()
  await page.getByRole('button', { name: 'Mbyll preferencat' }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('#ayah-255')).toBeVisible()
  await page.getByRole('tab', { name: 'Të ruajturat' }).click()
  await expect(page.locator('.saved-item')).toHaveCount(1)
  await page.locator('.saved-item button').first().click()
  await expect(page.locator('#ayah-1 .bookmark-button')).toHaveAttribute('aria-pressed', 'true')
  expect(errors).toEqual([])
})

test('Short and long chapters work on a phone without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('#ayah-1')).toBeVisible()
  await page.getByRole('button', { name: 'Hap menynë' }).click()
  await page.getByRole('textbox', { name: 'Filtro suret' }).fill('114')
  await page.locator('.surah-link').click()
  await expect(page.getByRole('heading', { name: 'En Nas', exact: true })).toBeVisible()
  await expect(page.locator('.ayah-card')).toHaveCount(6)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('Failed data load can be retried and bookmark removal persists', async ({ page }) => {
  await page.route('**/content/1.json', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByRole('alert')).toBeVisible()
  await page.unroute('**/content/1.json')
  await page.getByRole('button', { name: 'Provo përsëri' }).click()
  await expect(page.locator('#ayah-1')).toBeVisible()
  await page.getByRole('button', { name: 'Ruaj ajetin 1:1', exact: true }).click()
  await page.getByRole('button', { name: 'Hiq ajetin 1:1', exact: true }).click()
  await page.reload()
  await page.getByRole('tab', { name: 'Të ruajturat' }).click()
  await expect(page.locator('.saved-item')).toHaveCount(0)
})

test('Tafsir starts hidden, toggles per ayah and preserves shared lists', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.inline-tafsir')).toHaveCount(0)
  await page.getByRole('button', { name: 'Shfaq tefsirin e ajetit 1:1', exact: true }).click()
  await expect(page.locator('#tafsir-1')).toBeVisible()
  await expect(page.locator('#tafsir-1 .shared-note')).toContainText('1, 3')
  await expect(page.locator('#tafsir-1 ol').first()).toBeVisible()
  const indices = await page
    .locator('#tafsir-1 [data-source-index]')
    .evaluateAll((elements) => elements.map((el) => Number(el.dataset.sourceIndex)))
  expect(indices).toEqual([...new Set(indices)].sort((a, b) => a - b))
  await page.getByRole('button', { name: 'Shfaq tefsirin e ajetit 1:3', exact: true }).click()
  await expect(page.locator('#tafsir-1')).toHaveCount(0)
  await expect(page.locator('#tafsir-3')).toBeVisible()
  await page.getByRole('button', { name: 'Fshih tefsirin e ajetit 1:3', exact: true }).click()
  await expect(page.locator('.inline-tafsir')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.inline-tafsir')).toHaveCount(0)
})

test('Al-Baqarah 1–5 show separate commentary', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Surja pasuese', exact: true }).click()
  await page.getByRole('button', { name: 'Shfaq tefsirin e ajetit 2:2', exact: true }).click()
  await expect(page.locator('#tafsir-2')).toContainText('Ky është Libri')
  await expect(page.locator('#tafsir-2')).not.toContainText('E përkryejnë namazin')
  await page.getByRole('button', { name: 'Shfaq tefsirin e ajetit 2:3', exact: true }).click()
  await expect(page.locator('#tafsir-3')).toContainText('E përkryejnë namazin')
  await expect(page.locator('#tafsir-3')).not.toContainText('Ky është Libri')
})

for (const width of [390, 1440]) {
  test(`Switching tafsir keeps the new text in view at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    for (const ayah of [1, 2, 3, 2]) {
      await page
        .getByRole('button', { name: `Shfaq tefsirin e ajetit 1:${ayah}`, exact: true })
        .click()
      await expect(page.locator(`#tafsir-${ayah} .document-text`).first()).toBeInViewport()
      await expect(page.locator('.inline-tafsir')).toHaveCount(1)
    }
  })
}

test('Open all tafsir preference applies immediately, persists and allows individual toggles', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Preferencat', exact: true }).click()
  const option = page.getByRole('checkbox', { name: 'Hap të gjithë tefsirin si parazgjedhje' })
  await expect(option).not.toBeChecked()
  await option.check()
  await page.getByRole('button', { name: 'Mbyll preferencat' }).click()
  await expect(page.locator('.inline-tafsir')).toHaveCount(7)
  await expect(page.locator('#tafsir-3')).toContainText('Gjithmëshirshmit')
  await page.getByRole('button', { name: 'Fshih tefsirin e ajetit 1:2', exact: true }).click()
  await expect(page.locator('.inline-tafsir')).toHaveCount(6)
  await expect(page.locator('#tafsir-1')).toHaveCount(1)
  await page.getByRole('button', { name: 'Shfaq tefsirin e ajetit 1:2', exact: true }).click()
  await expect(page.locator('.inline-tafsir')).toHaveCount(7)
  await page.reload()
  await expect(page.locator('.inline-tafsir')).toHaveCount(7)
  await page.getByRole('textbox', { name: 'Filtro suret' }).fill('114')
  await page.locator('.surah-link').click()
  await expect(page.locator('.ayah-card')).toHaveCount(6)
  await expect(page.locator('.inline-tafsir')).toHaveCount(6)
  await page.getByRole('button', { name: 'Preferencat', exact: true }).click()
  await expect(option).toBeChecked()
  await option.uncheck()
  await page.getByRole('button', { name: 'Mbyll preferencat' }).click()
  await expect(page.locator('.inline-tafsir')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.ayah-card')).toHaveCount(6)
  await expect(page.locator('.inline-tafsir')).toHaveCount(0)
})

test('Search highlights normalized words in results and the opened ayah', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Kërko në Kuran', exact: false }).first().click()
  await page.getByRole('textbox', { name: 'Kërkimi në Kuran' }).fill('gjithmeshirshmit')
  await expect(page.locator('.search-result').first().locator('mark')).toHaveText(
    'Gjithmëshirshmit',
  )
  await page.locator('.search-result').first().click()
  await expect(
    page.locator('#ayah-1 .translation strong mark, #ayah-1 .translation mark strong'),
  ).toHaveText('Gjithmëshirshmit')
  await page.getByRole('button', { name: 'Surja pasuese', exact: true }).click()
  await expect(page.locator('.translation mark')).toHaveCount(0)
  await page.getByRole('button', { name: 'Kërko në Kuran', exact: false }).first().click()
  await page.getByRole('textbox', { name: 'Kërkimi në Kuran' }).fill('بسم')
  await expect(page.locator('.search-result').first().locator('[lang="ar"] mark')).toHaveCount(1)
  await page.locator('.search-result').first().click()
  await expect(page.locator('#ayah-1 .arabic-text mark')).toHaveCount(1)
})

test('Last reading shows one location, persists and supports quick return', async ({ page }) => {
  await page.goto('/')
  const links = page.locator('.recent-reading-link')
  for (const number of [2, 3, 4]) {
    await page.getByRole('combobox', { name: 'Shko tek ajeti' }).selectOption(String(number))
    await expect(links).toHaveCount(1)
    await expect(links.first()).toContainText(`1:${number}`)
  }
  await page.reload()
  await expect(links).toHaveCount(1)
  await expect(links.first()).toContainText('1:4')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Hap menynë' }).click()
  await expect(links.first()).toBeInViewport()
  await links.first().click()
  await expect(page.getByRole('combobox', { name: 'Shko tek ajeti' })).toHaveValue('4')
  await expect(page.locator('.sidebar')).not.toHaveClass(/is-open/)
})

test('Reading a scrolled-to ayah updates recent reading after a pause', async ({ page }) => {
  await page.goto('/')
  await page
    .locator('#ayah-5')
    .evaluate((element) => element.scrollIntoView({ behavior: 'instant', block: 'start' }))
  await expect(page.locator('.recent-reading-link').first()).toContainText('1:5')
})

for (const width of [390, 1440]) {
  test(`Suret opens a separate surah directory at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await page.getByRole('link', { name: 'Suret', exact: true }).click()
    await expect(page).toHaveURL(/#\/surahs$/)
    await expect(page.getByRole('heading', { name: 'Suret', exact: true })).toBeVisible()
    await expect(page.locator('.surah-tile')).toHaveCount(114)
    await expect(page.locator('#reader')).toHaveCount(0)
    await page.reload()
    await expect(page.locator('.surah-tile')).toHaveCount(114)
    await page.getByRole('searchbox', { name: 'Kërko një sure' }).fill('114')
    await expect(page.locator('.surah-tile')).toHaveCount(1)
    await page.locator('.surah-tile').click()
    await expect(page.getByRole('heading', { name: 'En Nas', exact: true })).toBeVisible()
    await expect(page.locator('.ayah-card')).toHaveCount(6)
    await page.goBack()
    await expect(page.getByRole('heading', { name: 'Suret', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('Copy ayah and copy with tafsir work while commentary is closed', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  await page.getByRole('button', { name: 'Veprime për ajetin 1:1', exact: true }).click()
  await page.getByRole('button', { name: 'Kopjo ajetin 1:1', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Ajeti u kopjua.')
  const ayah = await page.evaluate(() => navigator.clipboard.readText())
  expect(ayah).toContain('El Fatiha — 1:1')
  expect(ayah).toContain('بِسْمِ')
  expect(ayah).toContain('Me emrin e Allahut')
  expect(ayah).not.toContain('Tefsir Es-Saadi')
  await page.getByRole('button', { name: 'Veprime për ajetin 1:1', exact: true }).click()
  await page.getByRole('button', { name: 'Kopjo ajetin 1:1 me tefsir', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Ajeti dhe tefsiri u kopjuan.')
  const full = await page.evaluate(() => navigator.clipboard.readText())
  expect(full).toContain(ayah)
  expect(full).toContain('Tefsir Es-Saadi')
  expect(full).toContain('Shpjegim i përbashkët për ajetet 1, 3')
  await expect(page.locator('.inline-tafsir')).toHaveCount(0)
})

test('Copy reports an error when neither clipboard method is available', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Denied')
        },
      },
    })
    document.execCommand = () => false
  })
  await page.getByRole('button', { name: 'Veprime për ajetin 1:1', exact: true }).click()
  await page.getByRole('button', { name: 'Kopjo ajetin 1:1', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Kopjimi nuk u krye')
  await expect(
    page.getByRole('button', { name: 'Veprime për ajetin 1:1', exact: true }),
  ).toBeEnabled()
})

test('Copy uses the fallback when the async clipboard is unavailable', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error('Unavailable')
    }
  })
  await page.getByRole('button', { name: 'Veprime për ajetin 1:1', exact: true }).click()
  await page.getByRole('button', { name: 'Kopjo ajetin 1:1', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Ajeti u kopjua.')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('El Fatiha — 1:1')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('Ayah action menu dismisses with Escape and outside clicks and opens native sharing', async ({
  page,
}) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Veprime për ajetin 1:1', exact: true })
  const menu = page.locator('#ayah-1 .ayah-menu-options')
  await expect(menu).toHaveCount(0)
  await trigger.click()
  await expect(menu.getByRole('button')).toHaveCount(3)
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.locator('#ayah-1 .translation').click()
  await expect(menu).toHaveCount(0)
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data) => {
        window.sharedAyah = data
      },
    })
  })
  await trigger.click()
  await page.getByRole('button', { name: 'Shpërnda ajetin 1:1', exact: true }).click()
  expect(await page.evaluate(() => window.sharedAyah)).toMatchObject({
    title: 'El Fatiha — 1:1',
    text: expect.stringContaining('Me emrin e Allahut'),
  })
  await expect(menu).toHaveCount(0)
})

test('Sharing falls back to copying when native sharing is unavailable', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }),
  )
  await page.getByRole('button', { name: 'Veprime për ajetin 1:1', exact: true }).click()
  await expect(page.locator('#ayah-1 .ayah-menu-options')).toBeInViewport()
  await page.getByRole('button', { name: 'Shpërnda ajetin 1:1', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Ngjiteni aty ku dëshironi')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('El Fatiha — 1:1')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('Reading loader appears during loading and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  await page.route('**/content/1.json', async (route) => {
    await gate
    await route.continue()
  })
  await page.goto('/')
  const loader = page.getByRole('status', { name: 'Duke përgatitur leximin' })
  await expect(loader).toBeVisible()
  await expect(loader.locator('.loader-book')).toBeVisible()
  expect(
    await loader
      .locator('.loader-orbit')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none')
  release()
  await expect(page.locator('#ayah-1')).toBeVisible()
  await expect(loader).toHaveCount(0)
})
