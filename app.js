(function () {
  "use strict";

  const classifier = window.PromptClassifier;
  const input = document.querySelector("#prompt-input");
  const grid = document.querySelector("#category-grid");
  const analyzeButton = document.querySelector("#analyze-button");
  const sampleButton = document.querySelector("#sample-button");
  const clearButton = document.querySelector("#clear-button");
  const copyAllButton = document.querySelector("#copy-all-button");
  const fragmentCount = document.querySelector("#fragment-count");
  const summary = document.querySelector("#summary");
  const toast = document.querySelector("#toast");
  const languageButtons = document.querySelectorAll("[data-language]");

  const sample = "masterpiece, best quality, 1girl, young woman, long silver hair, green eyes, freckles, red leather jacket, black skirt, knee-high boots, standing in a rainy city street, looking at viewer, holding a transparent umbrella, neon lighting, cinematic wide shot, <lora:detail_slider_v4:0.8>";
  const accents = { clothing: "#f2c14e", scene: "#70a8ff", action: "#78e0c2", appearance: "#f18ba8", other: "#ad91ff" };
  const translations = {
    en: {
      documentTitle: "Prompt Sorter — organize Civitai prompts",
      description: "Sort English Civitai prompts into clothing, scene, action, and character appearance categories.",
      brandAria: "Prompt Sorter — back to top", languageAria: "Interface language", mode: "English prompts",
      eyebrow: "Civitai prompt organizer", heading: "Sort your prompt<br>into meaningful layers.",
      intro: "Paste an English prompt. The tool keeps the original wording and weights, then sorts each fragment by category.",
      inputLabel: "Source prompt", sample: "Example", clear: "Clear",
      placeholder: "For example: 1girl, long silver hair, green eyes, red leather jacket, standing in a rainy city street, neon lighting...",
      separatorHint: "Separate fragments with commas", fragmentCount: (count) => `Fragments found: ${count}`,
      analyze: "Analyze prompt", resultEyebrow: "Result", categories: "Categories", waiting: "Waiting for a prompt",
      copyAll: "Copy all", copy: "Copy", noteStrong: "Unknown fragments are never deleted.",
      noteText: "They go to “Other”. You can change any fragment’s category manually—the original wording and weights are preserved.",
      firstPrompt: "Paste an English prompt first", confidence: (value) => `${value}% confidence`,
      moveAria: (text) => `Move “${text}” to another category`, moved: (title) => `Moved to: ${title}`,
      copied: (title) => `Copied: ${title}`, copiedAll: "All categories copied",
      summary: (total, other) => `${total} fragments · ${other} in “Other”`,
      categoriesMeta: {
        clothing: ["Clothing", "Clothing and accessories will appear here"], scene: ["Scene", "Location, lighting, and composition will appear here"],
        action: ["Actions", "Poses and actions will appear here"], appearance: ["Appearance", "Character features will appear here"],
        other: ["Other", "Quality, style, and unknown words"]
      }
    },
    es: {
      documentTitle: "Prompt Sorter — organiza prompts de Civitai",
      description: "Clasifica prompts de Civitai en inglés por ropa, escena, acciones y apariencia de personajes.",
      brandAria: "Prompt Sorter — volver arriba", languageAria: "Idioma de la interfaz", mode: "Prompts en inglés",
      eyebrow: "Organizador de prompts de Civitai", heading: "Organiza tu prompt<br>en capas con sentido.",
      intro: "Pega un prompt en inglés. La herramienta conserva las palabras y los pesos originales, y clasifica cada fragmento por categoría.",
      inputLabel: "Prompt original", sample: "Ejemplo", clear: "Borrar",
      placeholder: "Por ejemplo: 1girl, long silver hair, green eyes, red leather jacket, standing in a rainy city street, neon lighting...",
      separatorHint: "Separa los fragmentos con comas", fragmentCount: (count) => `Fragmentos encontrados: ${count}`,
      analyze: "Analizar prompt", resultEyebrow: "Resultado", categories: "Categorías", waiting: "Esperando un prompt",
      copyAll: "Copiar todo", copy: "Copiar", noteStrong: "Los fragmentos desconocidos nunca se eliminan.",
      noteText: "Van a «Otros». Puedes cambiar manualmente la categoría de cualquier fragmento; se conservan la escritura y los pesos originales.",
      firstPrompt: "Primero pega un prompt en inglés", confidence: (value) => `${value}% de confianza`,
      moveAria: (text) => `Mover «${text}» a otra categoría`, moved: (title) => `Movido a: ${title}`,
      copied: (title) => `Copiado: ${title}`, copiedAll: "Todas las categorías copiadas",
      summary: (total, other) => `${total} fragmentos · ${other} en «Otros»`,
      categoriesMeta: {
        clothing: ["Ropa", "La ropa y los accesorios aparecerán aquí"], scene: ["Escena", "El lugar, la iluminación y la composición aparecerán aquí"],
        action: ["Acciones", "Las poses y acciones aparecerán aquí"], appearance: ["Apariencia", "Los rasgos de los personajes aparecerán aquí"],
        other: ["Otros", "Calidad, estilo y palabras desconocidas"]
      }
    },
    de: {
      documentTitle: "Prompt Sorter — Civitai-Prompts ordnen",
      description: "Englische Civitai-Prompts nach Kleidung, Szene, Aktionen und Aussehen der Figuren sortieren.",
      brandAria: "Prompt Sorter — nach oben", languageAria: "Sprache der Benutzeroberfläche", mode: "Englische Prompts",
      eyebrow: "Civitai-Prompt-Organizer", heading: "Ordne deinen Prompt<br>in sinnvolle Ebenen.",
      intro: "Füge einen englischen Prompt ein. Das Tool behält die ursprünglichen Wörter und Gewichtungen bei und ordnet jedes Fragment einer Kategorie zu.",
      inputLabel: "Ausgangsprompt", sample: "Beispiel", clear: "Leeren",
      placeholder: "Zum Beispiel: 1girl, long silver hair, green eyes, red leather jacket, standing in a rainy city street, neon lighting...",
      separatorHint: "Fragmente durch Kommas trennen", fragmentCount: (count) => `Gefundene Fragmente: ${count}`,
      analyze: "Prompt analysieren", resultEyebrow: "Ergebnis", categories: "Kategorien", waiting: "Warte auf einen Prompt",
      copyAll: "Alles kopieren", copy: "Kopieren", noteStrong: "Unbekannte Fragmente werden nie gelöscht.",
      noteText: "Sie landen unter „Sonstiges“. Die Kategorie jedes Fragments kann manuell geändert werden; ursprüngliche Schreibweise und Gewichtungen bleiben erhalten.",
      firstPrompt: "Füge zuerst einen englischen Prompt ein", confidence: (value) => `${value} % Sicherheit`,
      moveAria: (text) => `„${text}“ in eine andere Kategorie verschieben`, moved: (title) => `Verschoben nach: ${title}`,
      copied: (title) => `Kopiert: ${title}`, copiedAll: "Alle Kategorien kopiert",
      summary: (total, other) => `${total} Fragmente · ${other} unter „Sonstiges“`,
      categoriesMeta: {
        clothing: ["Kleidung", "Kleidung und Accessoires erscheinen hier"], scene: ["Szene", "Ort, Beleuchtung und Bildaufbau erscheinen hier"],
        action: ["Aktionen", "Posen und Aktionen erscheinen hier"], appearance: ["Aussehen", "Merkmale der Figuren erscheinen hier"],
        other: ["Sonstiges", "Qualität, Stil und unbekannte Wörter"]
      }
    }
  };
  let locale = "en";
  let items = [];
  let toastTimer;

  try {
    const savedLocale = localStorage.getItem("prompt-sorter-locale");
    if (translations[savedLocale]) locale = savedLocale;
  } catch (error) {
    locale = "en";
  }

  function t(key) {
    return translations[locale][key];
  }

  function metaFor(category) {
    const localized = t("categoriesMeta")[category];
    return { title: localized[0], empty: localized[1], accent: accents[category] };
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function grouped(category) {
    return items.filter((item) => item.category === category);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 1800);
  }

  function copyText(value, successMessage) {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => showToast(successMessage)).catch(() => {
      const helper = document.createElement("textarea");
      helper.value = value;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
      showToast(successMessage);
    });
  }

  function options(selected) {
    return classifier.CATEGORY_ORDER.map((key) => `<option value="${key}" ${key === selected ? "selected" : ""}>${metaFor(key).title}</option>`).join("");
  }

  function render() {
    grid.innerHTML = classifier.CATEGORY_ORDER.map((category, index) => {
      const data = grouped(category);
      const meta = metaFor(category);
      const chips = data.length ? data.map((item) => `
        <div class="prompt-chip" title="${t("confidence")(Math.round(item.confidence * 100))}">
          <span class="chip-text">${escapeHtml(item.text)}</span>
          <select class="chip-move" data-id="${item.id}" aria-label="${escapeHtml(t("moveAria")(item.text))}">
            ${options(category)}
          </select>
        </div>`).join("") : `<div class="empty-state">${meta.empty}</div>`;

      return `
        <article class="category-card" style="--accent:${meta.accent}">
          <div class="card-head">
            <div class="card-title"><span class="category-number">0${index + 1}</span><span class="category-dot"></span>${meta.title}</div>
            <span class="card-count">${data.length}</span>
          </div>
          <div class="chip-list">${chips}</div>
          <div class="card-foot"><button class="copy-button" data-copy="${category}" type="button" ${data.length ? "" : "disabled"}>${t("copy")}</button></div>
        </article>`;
    }).join("");

    const total = items.length;
    const uncertain = items.filter((item) => item.category === "other").length;
    summary.textContent = total ? t("summary")(total, uncertain) : t("waiting");
    copyAllButton.disabled = !total;
  }

  function updateStaticText() {
    document.documentElement.lang = locale;
    document.title = t("documentTitle");
    document.querySelector('meta[name="description"]').setAttribute("content", t("description"));
    document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((element) => { element.innerHTML = t(element.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => { element.setAttribute("aria-label", t(element.dataset.i18nAria)); });
    languageButtons.forEach((button) => {
      const active = button.dataset.language === locale;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const count = classifier.splitPrompt(input.value).length;
    fragmentCount.textContent = count ? t("fragmentCount")(count) : t("separatorHint");
    render();
  }

  function setLocale(nextLocale) {
    if (!translations[nextLocale]) return;
    locale = nextLocale;
    try { localStorage.setItem("prompt-sorter-locale", locale); } catch (error) { /* Storage may be unavailable. */ }
    updateStaticText();
  }

  function analyze() {
    items = classifier.analyze(input.value);
    render();
    if (!items.length) {
      showToast(t("firstPrompt"));
      input.focus();
      return;
    }
    document.querySelector("#results-title").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  input.addEventListener("input", () => {
    const count = classifier.splitPrompt(input.value).length;
    fragmentCount.textContent = count ? t("fragmentCount")(count) : t("separatorHint");
  });
  input.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") analyze();
  });
  analyzeButton.addEventListener("click", analyze);
  sampleButton.addEventListener("click", () => {
    input.value = sample;
    input.dispatchEvent(new Event("input"));
    analyze();
  });
  clearButton.addEventListener("click", () => {
    input.value = "";
    items = [];
    input.dispatchEvent(new Event("input"));
    render();
    input.focus();
  });
  grid.addEventListener("change", (event) => {
    const select = event.target.closest(".chip-move");
    if (!select) return;
    const item = items.find((candidate) => candidate.id === Number(select.dataset.id));
    if (item) {
      item.category = select.value;
      render();
      showToast(t("moved")(metaFor(select.value).title));
    }
  });
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    const category = button.dataset.copy;
    copyText(grouped(category).map((item) => item.text).join(", "), t("copied")(metaFor(category).title));
  });
  copyAllButton.addEventListener("click", () => {
    const value = classifier.CATEGORY_ORDER
      .map((category) => `[${metaFor(category).title}]\n${grouped(category).map((item) => item.text).join(", ")}`)
      .join("\n\n");
    copyText(value, t("copiedAll"));
  });

  languageButtons.forEach((button) => button.addEventListener("click", () => setLocale(button.dataset.language)));

  updateStaticText();
})();
