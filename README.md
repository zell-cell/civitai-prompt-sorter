# Civitai Prompt Sorter

A lightweight, privacy-friendly web tool for organizing English Civitai and Stable Diffusion prompts into meaningful categories.

**Live demo:** [prompt-sorter-civitai.qlex56.chatgpt.site](https://prompt-sorter-civitai.qlex56.chatgpt.site)

## What it does

Paste a comma-separated image-generation prompt and the sorter groups each fragment into:

- **Clothing** — garments, footwear, accessories, and materials
- **Scene** — locations, environments, lighting, camera angles, and composition
- **Actions** — poses, gestures, movement, and character interactions
- **Appearance** — hair, eyes, skin, body traits, and character features
- **Other** — quality tags, styles, model syntax, and unrecognized fragments

The original spelling, prompt weights, and LoRA tags are preserved. Any fragment can be reassigned manually before copying the result.

## Features

- Runs entirely in the browser with no server-side prompt processing
- Preserves weighted syntax such as `(red dress:1.2)`
- Preserves LoRA and other technical tags
- Copies individual categories or the complete organized result
- Responsive interface for desktop and mobile
- Interface languages: English, Spanish, and German
- Remembers the selected interface language locally
- No dependencies, build step, account, or API key required

> [!NOTE]
> Prompt classification currently targets English prompt vocabulary. Spanish and German are interface languages only. Unknown fragments are kept under **Other** instead of being removed.

## Run locally

Clone the repository and serve its root directory with any static web server:

```bash
python -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173).

You can also open `index.html` directly in a modern browser.

## Project structure

```text
├── index.html      # Application markup
├── styles.css      # Responsive visual design
├── classifier.js   # Prompt parsing and classification engine
└── app.js          # Interface, localization, and clipboard actions
```

## How classification works

The classifier combines curated prompt vocabulary with phrase matching and contextual patterns. It is intentionally conservative: when a fragment cannot be classified reliably, it stays available in **Other** for manual review.

The project is fully client-side and does not send prompt text to an external service.

## Browser support

The latest versions of Chrome, Edge, Firefox, and Safari are recommended.

## Contributing

Contributions that improve vocabulary coverage, classification accuracy, accessibility, or localization are welcome.
