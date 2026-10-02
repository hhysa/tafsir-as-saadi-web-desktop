export function readPreferences(storage) {
  const defaults = {
    surah: 1,
    ayah: 1,
    bookmarks: [],
    recentRead: [],
    theme: 'light',
    scale: 1,
    albanianScale: 1,
    showArabic: true,
    showAlbanian: true,
    openAllTafsir: false,
  }
  try {
    const saved = JSON.parse(storage.getItem('tefsir.preferences.v1')) || {}
    return {
      ...defaults,
      surah:
        Number.isInteger(saved.surah) && saved.surah >= 1 && saved.surah <= 114 ? saved.surah : 1,
      ayah: Number.isInteger(saved.ayah) && saved.ayah >= 1 && saved.ayah <= 286 ? saved.ayah : 1,
      bookmarks: Array.isArray(saved.bookmarks)
        ? [...new Set(saved.bookmarks.filter((id) => /^\d{1,3}:\d{1,3}$/.test(id)))]
        : [],
      recentRead: Array.isArray(saved.recentRead)
        ? [
            ...new Set(
              saved.recentRead.filter(
                (id) =>
                  typeof id === 'string' &&
                  /^(?:[1-9]|[1-9]\d|10\d|11[0-4]):[1-9]\d{0,2}$/.test(id),
              ),
            ),
          ].slice(0, 3)
        : [],
      theme: saved.theme === 'dark' ? 'dark' : 'light',
      scale:
        typeof saved.scale === 'number' && saved.scale >= 0.85 && saved.scale <= 1.4
          ? saved.scale
          : 1,
      albanianScale:
        typeof saved.albanianScale === 'number' &&
        saved.albanianScale >= 0.85 &&
        saved.albanianScale <= 1.4
          ? saved.albanianScale
          : typeof saved.scale === 'number' && saved.scale >= 0.85 && saved.scale <= 1.4
            ? saved.scale
            : 1,
      openAllTafsir: saved.openAllTafsir === true,
      showArabic: saved.showArabic !== false,
      showAlbanian: saved.showAlbanian !== false || saved.showArabic === false,
    }
  } catch {
    return defaults
  }
}

export function rememberReading(recent, id) {
  return [id, ...recent.filter((entry) => entry !== id)].slice(0, 3)
}
