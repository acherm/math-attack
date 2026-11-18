import { afterEach, describe, expect, it } from 'vitest';
import {
  TRANSLATIONS,
  hideKeyHints,
  keyLabel,
  setLang,
  setTextVariants,
  t
} from '../src/i18n/i18n.js';

describe('Touch-screen texts', () => {
  afterEach(() => {
    setTextVariants([]);
    setLang('fr');
  });

  it('hides keyboard shortcuts but keeps in-game labels', () => {
    expect(hideKeyHints('☰ MENU [ESC]')).toBe('☰ MENU');
    expect(hideKeyHints('👕 Voir les 20 Skins [K]')).toBe('👕 Voir les 20 Skins');
    expect(hideKeyHints('▶ JOUER (ESPACE / ENTRÉE)')).toBe('▶ JOUER');
    expect(hideKeyHints('▶ NEXT STAGE [SPACE]')).toBe('▶ NEXT STAGE');
    expect(hideKeyHints('Bloc [? AIDE] : Affiche une Solution')).toBe('Bloc [? AIDE] : Affiche une Solution');
    expect(hideKeyHints('Bulle [×2]')).toBe('Bulle [×2]');
  });

  it('keeps keyboard texts by default, and uses touch variants on touch screens', () => {
    setLang('fr');
    expect(t('menuBtn')).toBe('☰ MENU [ESC]');
    expect(keyLabel('⏪ [U]')).toBe('⏪ [U]');
    expect(t('hudHint')).toBe(TRANSLATIONS.fr.hudHint);

    setTextVariants(['Touch']); // on-screen gamepad
    expect(t('menuBtn')).toBe('☰ MENU');
    expect(keyLabel('⏪ [U]')).toBe('⏪');
    expect(t('hudHint')).toBe(TRANSLATIONS.fr.hudHintTouch);
    expect(t('modeCoopSub', { p1: 'Ben', p2: 'Alice' })).toBe('Tablette : Alice à gauche • Ben à droite');

    setTextVariants(['Screen', 'Touch']); // "touch the screen" controls
    expect(t('hudHint')).toBe(TRANSLATIONS.fr.hudHintScreen);
    expect(t('skinsGalleryTitle')).toBe(TRANSLATIONS.fr.skinsGalleryTitleTouch);
    setLang('en');
    expect(t('hudHint')).toBe(TRANSLATIONS.en.hudHintScreen);
  });

  it('has every text in both French and English', () => {
    expect(Object.keys(TRANSLATIONS.en).sort()).toEqual(Object.keys(TRANSLATIONS.fr).sort());
  });
});
