(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PromptClassifier = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CATEGORY_ORDER = ["clothing", "scene", "action", "appearance", "other"];

  const WORDS = {
    clothing: new Set((
      "shirt tshirt t-shirt blouse sweater sweatshirt hoodie cardigan jacket coat trenchcoat raincoat parka blazer vest waistcoat " +
      "dress sundress gown skirt miniskirt pants trousers jeans shorts leggings tights stockings socks suit tuxedo uniform costume " +
      "armor armour robe kimono yukata sari lingerie underwear panties bra corset bodysuit swimsuit bikini leotard pajamas nightgown " +
      "apron cape cloak poncho shawl scarf tie bowtie collar sleeve sleeves gloves mittens boots shoes sneakers heels sandals slippers " +
      "hat cap beanie beret bonnet hood helmet crown tiara veil mask eyepatch glasses sunglasses goggles monocle earrings earring " +
      "necklace choker bracelet wristband ring anklet belt suspenders garter handbag purse backpack clothing clothes outfit attire " +
      "uniform schoolgirl sailor bikini top bottom footwear headwear jewelry jewellery zipper buttons button pocket pockets ribbon bow " +
      "lace frills ruffles plaid striped checkered polka-dot denim leather latex silk satin velvet cotton wool transparent sheer sleeveless " +
      "strapless backless open-shirt open_clothes thighhighs thigh-highs pantyhose kneehighs loafers pumps trainers camisole tanktop"
    ).split(/\s+/)),
    scene: new Set((
      "background foreground scenery environment scene landscape city street alley road highway sidewalk bridge rooftop balcony room bedroom " +
      "bathroom kitchen classroom office studio library cafe restaurant bar shop market station airport train subway bus car vehicle church " +
      "castle palace temple shrine ruins dungeon forest woods jungle meadow field garden park beach coast ocean sea lake river waterfall mountain " +
      "valley desert cave space galaxy planet sky clouds cloud sunset sunrise night daytime morning evening dawn dusk rain snow storm fog mist wind " +
      "weather indoors indoor outdoors outdoor interior exterior architecture building house apartment window door wall floor ceiling stairs " +
      "lighting light sunlight moonlight neon candlelight fire glow shadows shadow dark bright bokeh depth-of-field depth_of_field cityscape " +
      "cyberpunk steampunk fantasy medieval futuristic modern victorian japanese chinese european tropical urban rural underwater classroom"
    ).split(/\s+/)),
    action: new Set((
      "standing sitting kneeling lying reclining walking running jumping flying falling swimming dancing fighting attacking holding carrying " +
      "wearing looking watching reading writing drawing painting eating drinking cooking sleeping waking smiling laughing crying shouting talking " +
      "singing blushing winking pointing reaching touching hugging kissing embracing waving posing leaning bending crouching squatting stretching " +
      "pulling pushing opening closing riding driving aiming shooting casting playing praying thinking working exercising turning facing gazing " +
      "staring biting licking panting sweating trembling hands-on-hips crossed-arms arms-up arms-behind-back hand-on-hip hand-in-pocket salute " +
      "solo duo group interaction running-away looking-at-viewer looking-back looking-down looking-up from-behind"
    ).split(/\s+/)),
    appearance: new Set((
      "girl boy woman man female male person people child teenager adult elderly young old baby character characters 1girl 1boy 2girls 2boys " +
      "face eyes eye hair skin body head arms arm hands hand legs leg feet foot ears ear nose mouth lips teeth tongue breasts chest waist hips " +
      "thighs shoulders neck stomach navel back buttocks ass beard mustache moustache eyebrows eyelashes freckles mole scar scars tattoo tattoos " +
      "makeup lipstick eyeliner eyeshadow nail-polish fingernails horns wings tail halo animal-ears cat-ears elf-ears pointed-ears glasses " +
      "blonde blond brunette black-haired brown-haired red-haired blue-haired green-haired pink-haired purple-haired white-haired silver-haired " +
      "long-hair short-hair medium-hair curly-hair wavy-hair straight-hair ponytail twintails braid braids bun bangs ahoge bald " +
      "blue-eyes green-eyes brown-eyes red-eyes yellow-eyes purple-eyes heterochromia pale tan tanned dark-skinned fair-skinned " +
      "slim slender skinny petite tall short muscular athletic curvy plump chubby fat wide-hips narrow-waist abs beautiful handsome cute pretty " +
      "ugly detailed-face detailed-eyes facial-features expression smile frown angry sad happy surprised scared serious open-mouth closed-mouth"
    ).split(/\s+/)),
  };

  const PHRASES = {
    clothing: [
      "school uniform", "business suit", "evening gown", "wedding dress", "maid outfit", "sailor uniform", "sports bra", "crop top",
      "tank top", "button-up shirt", "high heels", "combat boots", "knee-high boots", "thigh high", "bare shoulders", "off shoulder",
      "open jacket", "open shirt", "wet clothes", "see-through", "clothing cutout", "no bra", "barefoot"
    ],
    scene: [
      "in the background", "in background", "on the beach", "in a forest", "in the forest", "city street", "at night", "golden hour",
      "blue hour", "studio lighting", "natural lighting", "dramatic lighting", "soft lighting", "rim lighting", "volumetric lighting",
      "cinematic lighting", "shallow depth of field", "depth of field", "wide shot", "close-up", "close up", "full body shot",
      "upper body", "from above", "from below", "dutch angle", "dynamic angle", "indoors", "outdoors", "plain background",
      "white background", "black background", "simple background"
    ],
    action: [
      "looking at viewer", "eye contact", "hands on hips", "arms crossed", "arms raised", "hand on hip", "hand in pocket",
      "sitting on", "lying on", "leaning against", "walking toward", "running through", "holding hands", "holding a", "holding an",
      "taking a selfie", "peace sign", "thumbs up", "crossed legs", "spread arms", "head tilt", "action pose", "dynamic pose"
    ],
    appearance: [
      "long hair", "short hair", "medium hair", "curly hair", "wavy hair", "straight hair", "messy hair", "hair bun", "side ponytail",
      "blue eyes", "green eyes", "brown eyes", "red eyes", "purple eyes", "black eyes", "white hair", "black hair", "brown hair",
      "blonde hair", "red hair", "pale skin", "dark skin", "tan skin", "fair skin", "pointed ears", "animal ears", "cat ears",
      "small breasts", "medium breasts", "large breasts", "wide hips", "narrow waist", "muscular body", "slender body", "full lips"
    ]
  };

  const CAMERA_SCENE = /\b(?:shot|view|angle|lens|camera|focus|composition|portrait|closeup|close-up|panorama|perspective|lighting|background)\b/i;
  const PLACE_HINT = /\b(?:in|inside|outside|at|on|near|beside|behind|before|under|above|within|throughout)\s+(?:an?\s+|the\s+)?[a-z]/i;
  const ACTION_HINT = /\b(?:is\s+|are\s+|while\s+)?[a-z]+ing\b/i;
  const APPEARANCE_PAIR = /\b(?:hair|eyes?|skin|body|face|lips?|breasts?|hips?|waist|ears?|tail|wings?)\b/i;
  const QUALITY_STYLE = /\b(?:masterpiece|best quality|high quality|highres|hires|ultra detailed|detailed|8k|4k|uhd|hdr|photorealistic|realistic|anime|manga|illustration|digital art|oil painting|watercolor|sketch|render|octane|ray tracing|award winning|trending|style|artist|score[_\s])/i;
  const TECHNICAL = /^(?:<[^>]+>|break|and|or|embedding\b|negative\b|nsfw\b|safe\b)/i;

  function splitPrompt(input) {
    const text = String(input || "").replace(/\r\n?/g, "\n");
    const parts = [];
    let current = "";
    let quote = null;
    let angleDepth = 0;

    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if ((ch === '"' || ch === "'") && text[i - 1] !== "\\") quote = quote === ch ? null : (quote || ch);
      if (!quote && ch === "<") angleDepth += 1;
      if (!quote && ch === ">" && angleDepth > 0) angleDepth -= 1;
      const separator = !quote && angleDepth === 0 && (ch === "," || ch === ";" || ch === "\n" || ch === "|");
      if (separator) {
        if (current.trim()) parts.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  function normalize(value) {
    return value
      .toLowerCase()
      .replace(/<[^>]+>/g, " ")
      .replace(/\b(?:score|rating)[_\s][a-z0-9_+-]+\b/g, " ")
      .replace(/:[+-]?(?:\d+(?:\.\d+)?|\.\d+)\s*[)\]}]*$/g, " ")
      .replace(/[()[\]{}]/g, " ")
      .replace(/[_/]+/g, "-")
      .replace(/[^a-z0-9' -]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function classify(fragment) {
    const clean = normalize(fragment);
    const scores = { clothing: 0, scene: 0, action: 0, appearance: 0, other: 0 };
    if (!clean || TECHNICAL.test(clean)) return { category: "other", confidence: 1, scores };

    for (const category of CATEGORY_ORDER.slice(0, 4)) {
      for (const phrase of PHRASES[category]) {
        if (clean.includes(phrase)) scores[category] += phrase.split(" ").length + 2;
      }
    }

    const tokens = clean.split(/[\s-]+/).filter(Boolean);
    for (const token of tokens) {
      for (const category of CATEGORY_ORDER.slice(0, 4)) {
        if (WORDS[category].has(token) || WORDS[category].has(clean)) scores[category] += 2;
      }
    }

    if (CAMERA_SCENE.test(clean)) scores.scene += 3;
    if (PLACE_HINT.test(clean)) scores.scene += 2;
    if (ACTION_HINT.test(clean) && !/\b(?:clothing|earring|lighting|stocking|ceiling)\b/i.test(clean)) scores.action += 2;
    if (APPEARANCE_PAIR.test(clean)) scores.appearance += 2;
    if (/\b(?:wearing|dressed in|putting on|taking off)\b/i.test(clean)) scores.clothing += 3;
    if (/\b(?:pose|gesture|expression|looking|facing)\b/i.test(clean)) scores.action += 2;
    if (QUALITY_STYLE.test(clean)) scores.other += 4;

    const ranked = CATEGORY_ORDER.map((category) => [category, scores[category]])
      .sort((a, b) => b[1] - a[1]);
    const best = ranked[0];
    const second = ranked[1];
    if (best[1] === 0) return { category: "other", confidence: 0, scores };

    const confidence = Math.max(0.35, Math.min(0.99, (best[1] - second[1] + 2) / (best[1] + 2)));
    return { category: best[0], confidence, scores };
  }

  function analyze(input) {
    return splitPrompt(input).map((text, index) => {
      const result = classify(text);
      return { id: index + 1, text, category: result.category, originalCategory: result.category, confidence: result.confidence, scores: result.scores };
    });
  }

  return { CATEGORY_ORDER, splitPrompt, normalize, classify, analyze };
});
