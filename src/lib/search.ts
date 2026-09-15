/**
 * Utility functions for fuzzy search, typo correction, and autocomplete matching
 */

// Levenshtein distance between two strings
export function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

// Common e-commerce dictionary terms for instant typo correction
export const DICTIONARY_TERMS: Record<string, string> = {
  // Misspellings -> Correct Terms
  headfone: "headphones",
  headfones: "headphones",
  hedphone: "headphones",
  hedphones: "headphones",
  headphon: "headphones",
  earfone: "earphones",
  earfones: "earphones",
  erbuds: "earbuds",
  airbuds: "earbuds",
  airpod: "pods",
  airpods: "pods",
  earpod: "pods",
  ipone: "iphone",
  iphne: "iphone",
  aiphone: "iphone",
  leptop: "laptop",
  lptop: "laptop",
  lapotp: "laptop",
  notebook: "laptop",
  notbook: "laptop",
  speeker: "speaker",
  speekers: "speakers",
  spekr: "speaker",
  smarwatch: "smartwatch",
  smartwach: "smartwatch",
  whatch: "watch",
  watche: "watch",
  shues: "shoes",
  sneekers: "sneakers",
  sneekr: "sneakers",
  snkr: "sneakers",
  tshrt: "t-shirt",
  "t shrt": "t-shirt",
  teeshirt: "t-shirt",
  tishirt: "t-shirt",
  hoddie: "hoodie",
  hodi: "hoodie",
  espreso: "espresso",
  espresoo: "espresso",
  coffe: "coffee",
  cofee: "coffee",
  charget: "charger",
  chrg: "charger",
  fastcharger: "charger",
  novaudio: "novaaudio",
  novaudioo: "novaaudio",
  zenit: "zenith",
  znith: "zenith",
  culnary: "culinarycraft",
  culinery: "culinarycraft",
  plsefit: "pulsefit",
  pulsfit: "pulsefit",
  voltgare: "voltgear",
  voltger: "voltgear",
  urbaanweave: "urbanweave",
  aureliaa: "aurelia atelier",
  electonics: "electronics",
  elec: "electronics",
  electrnic: "electronics",
};

// Known catalog keywords for fallback fuzzy matching
export const CATALOG_KEYWORDS = [
  "headphones",
  "earbuds",
  "wireless",
  "bluetooth",
  "laptop",
  "smartwatch",
  "charger",
  "espresso",
  "coffee",
  "shoes",
  "sneakers",
  "t-shirt",
  "hoodie",
  "shirt",
  "dress",
  "electronics",
  "fashion",
  "kitchen",
  "fitness",
  "novaaudio",
  "zenith",
  "pulsefit",
  "voltgear",
  "urbanweave",
  "aurelia",
  "culinarycraft",
  "dutch oven",
  "noise cancelling",
  "spatial audio",
  "titanium",
  "amoled",
  "fast charging",
  "oxford cotton",
  "silk wrap",
  "barista",
];

/**
 * Detects whether a query is a typo and returns the corrected term if available
 */
export function detectAndCorrectTypo(query: string): {
  isTypo: boolean;
  corrected: string | null;
} {
  const normalized = query.toLowerCase().trim();
  if (!normalized || normalized.length < 3) {
    return { isTypo: false, corrected: null };
  }

  // 1. Check direct dictionary map
  if (DICTIONARY_TERMS[normalized]) {
    return { isTypo: true, corrected: DICTIONARY_TERMS[normalized] };
  }

  // Check multi-word phrase
  const words = normalized.split(/\s+/);
  let changed = false;
  const correctedWords = words.map((w) => {
    if (DICTIONARY_TERMS[w]) {
      changed = true;
      return DICTIONARY_TERMS[w];
    }
    return w;
  });

  if (changed) {
    return { isTypo: true, corrected: correctedWords.join(" ") };
  }

  // 2. Levenshtein fuzzy distance matching against known catalog keywords
  let bestMatch: string | null = null;
  let minDistance = 999;

  for (const keyword of CATALOG_KEYWORDS) {
    // If exact match or prefix, not a typo
    if (keyword === normalized || keyword.startsWith(normalized)) {
      return { isTypo: false, corrected: null };
    }

    const dist = levenshteinDistance(normalized, keyword);
    // Allow distance 1 for length 4-5, distance 2 for length 6+
    const maxAllowed = normalized.length >= 6 ? 2 : 1;

    if (dist <= maxAllowed && dist < minDistance) {
      minDistance = dist;
      bestMatch = keyword;
    }
  }

  if (bestMatch && minDistance > 0) {
    return { isTypo: true, corrected: bestMatch };
  }

  return { isTypo: false, corrected: null };
}

/**
 * Checks if a string looks like an SKU code (e.g. NOVA-ANC-BLK, ZEN-P16, etc.)
 */
export function isLikelySku(query: string): boolean {
  const trimmed = query.trim().toUpperCase();
  // Typically 3+ characters with hyphen or alphanumeric format
  return /^[A-Z0-9]{2,6}(-[A-Z0-9]{2,6})+$/.test(trimmed) || /^(NOVA|ZEN|VOLT|URB|AUR|CUL|PULSE)/i.test(trimmed);
}
