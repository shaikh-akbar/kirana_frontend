/**
 * A glyph for a product tile. Purely decorative: the catalog has no icon field
 * and a kirana owner is not going to pick one per item, so it is derived from
 * the words already in the category or product name. Anything unrecognised
 * falls back to a sack, which is what most of the shop is.
 */
const KEYWORD_EMOJI = [
  [/rice|grain|atta|flour|wheat|besan|rava|poha/i, '🌾'],
  [/dal|pulse|chana|moong|toor|arhar|urad|masoor|rajma/i, '🫘'],
  [/oil|ghee|vanaspati/i, '🛢️'],
  [/spice|masala|chilli|mirch|turmeric|haldi|jeera|dhania/i, '🌶️'],
  [/sugar|salt|gud|jaggery/i, '🧂'],
  [/dry ?fruit|cashew|almond|kaju|badam|raisin|kishmish|pista/i, '🥜'],
  [/tea|chai|coffee|beverage|drink/i, '🍵'],
  [/soap|detergent|surf|cleaner|phenyl/i, '🧼'],
  [/biscuit|snack|namkeen|chips|wafer/i, '🍪'],
  [/milk|dairy|paneer|butter|curd/i, '🥛'],
]

export function productEmoji(product) {
  const haystack = `${product?.category || ''} ${product?.name || ''}`
  for (const [pattern, emoji] of KEYWORD_EMOJI) {
    if (pattern.test(haystack)) return emoji
  }
  return '📦'
}
