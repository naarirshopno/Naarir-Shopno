import { Product } from '../types';

// Normalize Bangla Unicode variants (NFC + Nukta characters + punctuation)
export function normalizeSearchText(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFC')
    .toLowerCase()
    .replace(/\u09A1\u09BC/g, '\u09DC') // ড + ় -> ড়
    .replace(/\u09A2\u09BC/g, '\u09DD') // ঢ + ় -> ঢ়
    .replace(/\u09AF\u09BC/g, '\u09DF') // য + ় -> য়
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

function compactAlnum(input: string): string {
  return normalizeSearchText(input).replace(/[^a-z0-9\u0980-\u09FF]/g, '');
}

// Phonetic skeleton normalizer for Banglish spelling variations (ee->i, oo->u, ph->f, etc.)
function normalizeLatinSkeleton(str: string): string {
  return str
    .toLowerCase()
    .replace(/ph/g, 'f')
    .replace(/bh/g, 'v')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/sh|chh/g, 's')
    .replace(/ch/g, 'c')
    .replace(/jh/g, 'j')
    .replace(/ee|ei|ey/g, 'i')
    .replace(/oo|ou/g, 'u')
    .replace(/aa/g, 'a')
    .replace(/z/g, 'j')
    .replace(/q/g, 'k')
    .replace(/w/g, 'o')
    .replace(/(.)\1+/g, '$1')
    .replace(/[^a-z0-9]/g, '');
}

// Schwa-invariant skeleton removes inherent Bangla 'a'/'o' vowels so compound words match with or without 'a'/'o' (e.g. রূপকথা <-> rupkotha)
function normalizeSchwaSkeleton(str: string): string {
  return normalizeLatinSkeleton(str).replace(/[ao]/g, '');
}

const BN_CONSONANTS: Record<string, string> = {
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'ch', 'জ': 'j', 'ঝ': 'j', 'ঞ': 'n',
  'ট': 't', 'ঠ': 't', 'ড': 'd', 'ঢ': 'd', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'd', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'v', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 's', 'ষ': 's', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ড়': 'r', 'ঢ়': 'r', 'ঢ়': 'r', 'য়': 'y', 'য়': 'y', 'ৎ': 't',
};

const BN_INDEPENDENT_VOWELS: Record<string, string> = {
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u',
  'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
};

const BN_VOWEL_SIGNS: Record<string, string> = {
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u',
  'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
};

const BN_DIGITS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
};

// Convert Bangla script words into phonetic Romanized text so Banglish typing matches any Bangla title/word
export function banglaToPhoneticLatin(input: string): string {
  const norm = normalizeSearchText(input);
  let out = '';
  const chars = Array.from(norm);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];

    if (BN_DIGITS[ch]) {
      out += BN_DIGITS[ch];
    } else if (BN_INDEPENDENT_VOWELS[ch]) {
      out += BN_INDEPENDENT_VOWELS[ch];
    } else if (BN_CONSONANTS[ch]) {
      out += BN_CONSONANTS[ch];
      if (next === '্') {
        // Virama suppresses inherent vowel and skip next virama char
        i++;
      } else if (next && BN_VOWEL_SIGNS[next]) {
        out += BN_VOWEL_SIGNS[next];
        i++;
      } else if (next && (BN_CONSONANTS[next] || next === 'ং')) {
        // Inherent vowel between consonants often typed as a/o in Banglish
        out += 'a';
      }
    } else if (BN_VOWEL_SIGNS[ch]) {
      out += BN_VOWEL_SIGNS[ch];
    } else if (ch === 'ং') {
      out += 'ng';
    } else if (ch === 'ঃ' || ch === 'ঁ' || ch === '্') {
      // ignore nasal/silent signs
    } else {
      out += ch;
    }
  }

  return out;
}

// Also produce an 'o'-vowel variant skeleton for inherent Bangla vowel 'অ'/'অ'-sound words (e.g. জর্জেট -> jorjet)
function banglaToPhoneticLatinOVariant(input: string): string {
  const norm = normalizeSearchText(input);
  let out = '';
  const chars = Array.from(norm);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];

    if (BN_DIGITS[ch]) {
      out += BN_DIGITS[ch];
    } else if (BN_INDEPENDENT_VOWELS[ch]) {
      out += BN_INDEPENDENT_VOWELS[ch];
    } else if (BN_CONSONANTS[ch]) {
      out += BN_CONSONANTS[ch];
      if (next === '্') {
        i++;
      } else if (next && BN_VOWEL_SIGNS[next]) {
        out += BN_VOWEL_SIGNS[next];
        i++;
      } else if (next && (BN_CONSONANTS[next] || next === 'ং')) {
        out += 'o';
      }
    } else if (BN_VOWEL_SIGNS[ch]) {
      out += BN_VOWEL_SIGNS[ch];
    } else if (ch === 'ং') {
      out += 'ng';
    } else if (ch === 'ঃ' || ch === 'ঁ' || ch === '্') {
      // ignore
    } else {
      out += ch;
    }
  }

  return out;
}

// Semantic synonym groups across English, Banglish, and Bangla for fashion storefront terms
const BILINGUAL_GROUPS: string[][] = [
  ['three piece', 'three-piece', 'threepiece', '3 piece', '3-piece', '3piece', 'থ্রি-পিস', 'থ্রিপিস', 'থ্রি পিস', '৩ পিস', 'salwar', 'সালোয়ার', 'সালোয়ার', 'কামিজ'],
  ['two piece', 'two-piece', 'twopiece', '2 piece', '2-piece', '2piece', 'টু-পিস', 'টুপিস', 'টু পিস', '২ পিস'],
  ['readymade', 'ready made', 'ready-made', 'stitched', 'রেডিমেড', 'রেডিমেট', 'সেলাই করা', 'সেমি-স্টিচড', 'semi-stitched', 'semi stitched'],
  ['unstitched', 'unstitch', 'un-stitched', 'আনস্টিচ', 'আনস্টিজ', 'আনস্টিচড', 'সেলাই ছাড়া', 'সেলাই ছাড়া'],
  ['saree', 'sarees', 'sharee', 'sari', 'shari', 'শাড়ি', 'শাড়ি', 'শাড়ী', 'শাড়ী', 'blouse', 'ব্লাউজ'],
  ['jamdani', 'জামদানি', 'ঢাকাই'],
  ['katan', 'kataan', 'banarasi', 'benarasi', 'kanjivaram', 'কাতান', 'বেনারসি', 'কাঞ্জিভরম'],
  ['handprint', 'hand print', 'hand painted', 'handpaint', 'হ্যান্ডপ্রিন্ট', 'হ্যান্ডপেইন্ট'],
  ['tant', 'taant', 'handloom', 'তাঁত', 'তাঁতের', 'হ্যান্ডলুম'],
  ['muslin', 'maslin', 'মসলিন'],
  ['silk', 'half-silk', 'half silk', 'সিল্ক', 'হাফ-সিল্ক', 'রেশম'],
  ['organza', 'অরগানজা', 'অরগাঞ্জা', 'ওরগানজা'],
  ['georgette', 'jorjet', 'jorget', 'chiffon', 'জর্জেট', 'সিফন'],
  ['cotton', 'suti', 'suty', 'lawn', 'voile', 'সুতি', 'লন', 'ভয়েল', 'খাদি', 'khadi'],
  ['velvet', 'ভেলভেট', 'মখমল'],
  ['linen', 'লিনেন'],
  ['rayon', 'রেয়ন', 'রেয়ন'],
  ['kurti', 'kurty', 'kurtis', 'কুর্তি', 'টপস', 'tops', 'tunic'],
  ['gown', 'gowns', 'gaun', 'maxi', 'frock', 'গাউন', 'ফ্রক', 'ম্যাক্সি'],
  ['lehenga', 'lehengas', 'lahenga', 'lehnga', 'ghagra', 'লেহেঙ্গা', 'লেহেংগা'],
  ['bridal', 'wedding', 'biye', 'party', 'festive', 'ব্রাইডাল', 'বিয়ের', 'বিয়ের', 'পার্টি', 'বউ', 'উৎসব'],
  ['embroidery', 'embroidered', 'work', 'karchupi', 'zardosi', 'sequin', 'stone', 'kundan', 'এমব্রয়ডারি', 'এম্ব্রয়ডারি', 'কারচুপি', 'জারদৌসি', 'স্টোন', 'নকশা'],
  ['print', 'printed', 'floral', 'digital', 'batik', 'block', 'প্রিন্ট', 'প্রিন্টেড', 'ফ্লোরাল', 'ডিজিটাল', 'বাটিক', 'ব্লক'],
  ['hijab', 'hejab', 'niqab', 'nikab', 'scarf', 'dupatta', 'orna', 'khimar', 'হিজাব', 'নিকাব', 'ওড়না', 'ওড়না', 'দোপাট্টা', 'খিমার'],
  ['abaya', 'borka', 'borkha', 'burkha', 'burqa', 'sunnati', 'modest', 'আবায়া', 'আবায়া', 'বোরকা', 'বোরখা', 'সুন্নাতি', 'সুন্নাহ', 'পর্দা'],
  ['western', 'dress', 'dresses', 'apparel', 'poshak', 'jama', 'ওয়েস্টার্ন', 'ওয়েস্টার্ন', 'ড্রেস', 'পোশাক', 'জামা'],
  ['panjabi', 'punjabi', 'পাঞ্জাবি', 'পাঞ্জাবী'],
  ['t-shirt', 'tshirt', 't shirt', 'skirt', 'palazzo', 'pant', 'টি-শার্ট', 'টিশার্ট', 'স্কার্ট', 'প্যান্ট', 'প্লাজো'],
  ['inner', 'nighty', 'nightwear', 'lingerie', 'ইনার', 'নাইটি'],
  ['winter', 'shawl', 'sweater', 'cardigan', 'jacket', 'kashmiri', 'উইন্টার', 'শীত', 'শীতের', 'শাল', 'চাদর', 'কাশ্মীরি'],
  ['jewellery', 'jewelry', 'earring', 'necklace', 'bag', 'bags', 'purse', 'জুয়েলারি', 'গয়না', 'ব্যাগ', 'পার্স', 'নেকলেস'],
  ['bedsheet', 'bed sheet', 'bed.sheet', 'curtain', 'বিছানার চাদর', 'পর্দা'],
  ['indian', 'pakistani', 'jaipuri', 'ইন্ডিয়ান', 'ইন্ডিয়ান', 'ভারতীয়', 'পাকিস্তানি', 'পাকিস্তানী', 'জয়পুরী'],
  ['kids', 'baby', 'child', 'বাচ্চাদের', 'শিশু', 'বেবি'],
  ['red', 'lal', 'লাল'],
  ['black', 'kalo', 'কালো'],
  ['white', 'sada', 'off white', 'off-white', 'সাদা', 'অফ হোয়াইট', 'অফ-হোয়াইট'],
  ['pink', 'golapi', 'rose', 'peach', 'magenta', 'rani', 'গোলাপি', 'গোলাপী', 'রানি', 'রোজ', 'পিচ', 'ম্যাজেন্টা'],
  ['blue', 'nil', 'sky', 'royal', 'navy', 'firoza', 'নীল', 'আকাশি', 'আকাশী', 'রয়েল', 'নেভি', 'ফিরোজা'],
  ['green', 'sobuj', 'olive', 'emerald', 'mint', 'tiya', 'সবুজ', 'অলিভ', 'টিয়া', 'টিয়া', 'পেস্ট', 'এমেরাল্ড'],
  ['yellow', 'holud', 'mustard', 'golden', 'gold', 'হলুদ', 'গোল্ডেন', 'সোনালি'],
  ['maroon', 'wine', 'মেরুন', 'ওয়াইন'],
  ['purple', 'beguni', 'lavender', 'বেগুনি', 'ল্যাভেন্ডার'],
  ['orange', 'komola', 'কমলা'],
];

const NORMALIZED_GROUPS = BILINGUAL_GROUPS.map((group) =>
  group.map((term) => normalizeSearchText(term))
);

// Expand a query token/phrase into matching bilingual/Banglish alternatives
function expandSynonymTerms(token: string): string[] {
  const norm = normalizeSearchText(token);
  const comp = compactAlnum(token);
  const expanded = new Set<string>([norm]);

  for (const group of NORMALIZED_GROUPS) {
    const isHit = group.some((term) => {
      if (term === norm) return true;
      const termComp = compactAlnum(term);
      if (comp.length > 0 && termComp === comp) return true;
      if (comp.length >= 4 && termComp.startsWith(comp)) return true;

      const termWords = term.split(/[\s\-./]+/).filter(Boolean);
      return termWords.some(
        (word) =>
          word === norm ||
          (norm.length >= 4 && (word.startsWith(norm) || (word.length >= 4 && norm.startsWith(word))))
      );
    });
    if (isHit) {
      for (const term of group) {
        expanded.add(term);
      }
    }
  }

  return Array.from(expanded);
}

interface SearchIndex {
  raw: string;
  compact: string;
  phoneticA: string;
  phoneticO: string;
  skeletonA: string;
  skeletonO: string;
  schwaSkeleton: string;
}

function buildSearchIndex(fields: Array<string | undefined | null>): SearchIndex {
  const joined = normalizeSearchText(fields.filter(Boolean).join(' '));
  const phoneticA = banglaToPhoneticLatin(joined).toLowerCase();
  const phoneticO = banglaToPhoneticLatinOVariant(joined).toLowerCase();

  return {
    raw: joined,
    compact: compactAlnum(joined),
    phoneticA,
    phoneticO,
    skeletonA: normalizeLatinSkeleton(phoneticA),
    skeletonO: normalizeLatinSkeleton(phoneticO),
    schwaSkeleton: normalizeSchwaSkeleton(phoneticA),
  };
}

function matchesSingleTerm(index: SearchIndex, term: string): boolean {
  const norm = normalizeSearchText(term);
  const comp = compactAlnum(norm);
  if (!norm) return true;

  // For short pure-ASCII terms (1-3 letters, e.g. 'red', 'top', 'jam'), require word-start
  // boundary on Latin strings so 'red' doesn't match 'embroidered' while 'jam' still matches 'jamdani'
  if (/^[a-z]{1,3}$/.test(norm)) {
    const wordStartRe = new RegExp(`(?:^|[^a-z])${norm}`);
    if (
      wordStartRe.test(index.raw) ||
      wordStartRe.test(index.phoneticA) ||
      wordStartRe.test(index.phoneticO)
    ) {
      return true;
    }
    return false;
  }

  if (index.raw.includes(norm) || (comp && index.compact.includes(comp))) {
    return true;
  }

  // Phonetic Banglish matching when term contains English letters
  if (/[a-z]/.test(norm)) {
    const skel = normalizeLatinSkeleton(norm);
    const schwaSkel = normalizeSchwaSkeleton(norm);
    if (
      index.phoneticA.includes(norm) ||
      index.phoneticO.includes(norm) ||
      (skel.length >= 3 && (index.skeletonA.includes(skel) || index.skeletonO.includes(skel))) ||
      ((schwaSkel.length >= 4 || (norm.length >= 5 && schwaSkel.length >= 3)) &&
        index.schwaSkeleton.includes(schwaSkel))
    ) {
      return true;
    }
  }

  return false;
}

export function matchesBilingualQuery(fields: Array<string | undefined | null>, query: string): boolean {
  const normQuery = normalizeSearchText(query);
  if (!normQuery) return true;

  const index = buildSearchIndex(fields);

  // 1. Check full query phrase or its synonym group directly first
  const fullPhraseTerms = expandSynonymTerms(normQuery);
  if (fullPhraseTerms.some((term) => matchesSingleTerm(index, term))) {
    return true;
  }

  // 2. Check all whitespace-separated query words (every token must match directly, phonetically, or via synonyms)
  const tokens = normQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  return tokens.every((token) => {
    const tokenTerms = expandSynonymTerms(token);
    return tokenTerms.some((term) => matchesSingleTerm(index, term));
  });
}

export function matchesProductSearch(product: Product, query: string): boolean {
  if (!query.trim()) return true;

  const colorNames = Array.isArray(product.colors)
    ? product.colors.map((c) => c?.name).filter(Boolean).join(' ')
    : '';
  const sizeNames = Array.isArray(product.sizes)
    ? product.sizes.join(' ')
    : '';

  return matchesBilingualQuery(
    [
      product.name,
      product.bengaliName,
      product.category,
      product.categoryBengali,
      product.fabric,
      product.description,
      product.sku,
      colorNames,
      sizeNames,
    ],
    query
  );
}

export function matchesCategorySearch(
  category: { id: string; label: string },
  translatedLabel: string,
  query: string
): boolean {
  if (!query.trim()) return true;
  return matchesBilingualQuery([category.id, category.label, translatedLabel], query);
}
