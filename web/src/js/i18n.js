/**
 * Lightweight i18n module for vanilla JavaScript
 * Supports JSON translation files and localStorage persistence
 */
class I18n {
  constructor() {
    this.currentLang = "en";
    this.translations = {};
    this.defaultLang = "en";
    this.supportedLangs = ["en", "es", "fr", "de"];
  }

  /**
   * Initialize i18n: detect language and load translations
   */
  async init() {
    // Try localStorage, then browser language, default to English
    const savedLang = localStorage.getItem("lang");
    const browserLang = navigator.language.split("-")[0]; // 'en-US' -> 'en'
    const lang =
      savedLang ||
      (this.supportedLangs.includes(browserLang)
        ? browserLang
        : this.defaultLang);

    await this.loadLanguage(lang);
  }

  /**
   * Load translation file for specified language
   */
  async loadLanguage(lang) {
    if (!this.supportedLangs.includes(lang)) {
      console.warn(
        `Language '${lang}' not supported, falling back to ${this.defaultLang}`,
      );
      lang = this.defaultLang;
    }

    try {
      const response = await fetch(`/src/i18n/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);

      this.translations = await response.json();
      this.currentLang = lang;
      this.applyTranslations();
      this.updateLanguageSelector();
      localStorage.setItem("lang", lang);
    } catch (error) {
      console.error("Error loading translations:", error);
      if (lang !== this.defaultLang) {
        // Fallback to default language
        await this.loadLanguage(this.defaultLang);
      }
    }
  }

  /**
   * Apply translations to all elements with data-i18n attribute
   */
  applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation = this.get(key);

      if (translation) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          // Handle form inputs - translate placeholder
          if (el.placeholder) {
            el.placeholder = translation;
          }
        } else {
          // Handle regular elements - translate text content
          el.textContent = translation;
        }
      }
    });

    // Special handling for dynamic content (like character counter)
    this.updateDynamicContent();
  }

  /**
   * Update dynamic content that uses translation templates
   */
  updateDynamicContent() {
    // Character counter for label input
    const labelInput = document.getElementById("labelInput");
    if (labelInput) {
      const charCountElement = document.querySelector(
        '[data-i18n-template="label.charCount"]',
      );
      if (charCountElement) {
        const current = labelInput.value.length;
        const template = this.get("label.charCount");
        charCountElement.textContent = template.replace("{current}", current);
      }
    }
  }

  /**
   * Get translation for a key (supports dot notation: 'app.title')
   */
  get(key) {
    const keys = key.split(".");
    let value = this.translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    return value || key; // Return key if translation not found
  }

  /**
   * Update language selector to match current language
   */
  updateLanguageSelector() {
    const selector = document.getElementById("languageSelector");
    if (selector) {
      selector.value = this.currentLang;
    }
  }

  /**
   * Get current language code
   */
  getCurrentLang() {
    return this.currentLang;
  }
}

// Export singleton instance
const i18n = new I18n();
export default i18n;
