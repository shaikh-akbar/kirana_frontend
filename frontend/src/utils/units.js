/**
 * Unit handling, mirroring the server's model so the screens can show a running
 * total before the bill is posted.
 *
 * The model has two layers, and conflating them is the easy mistake:
 *   - `conversionFactor` says how many BASE units one sellable unit holds
 *     (1 BAG = 50 base units). It is a count, not a weight.
 *   - the BASE unit's own name is what makes that count weighable.
 * So a BAG of a KG-based product is 50 kg, while a BAG of a PACKET-based
 * product weighs nothing the bill can print — which is exactly why the client's
 * packet goods bill prints `Total Wtt.: 0.000Kg`.
 */

/** Kilograms per unit. Count-based units are deliberately absent, not zero. */
export const UNIT_NAME_TO_KG = Object.freeze({
  GRAM: 0.001,
  KG: 1,
  QUINTAL: 100,
})

/** The unit a product's quantities are stored and deducted in. */
export function baseUnitOf(product) {
  if (!product?.units?.length) return null
  return product.units.find((u) => u.isBaseUnit) || product.units[0]
}

/** Quantity in `unit` expressed in the product's base unit. */
export function toBaseUnits(quantity, unit) {
  const factor = Number(unit?.conversionFactor ?? 1)
  return Number(quantity || 0) * (factor || 1)
}

/**
 * Weight of a line, or 0 when the goods are counted rather than weighed.
 * Matches `baseUnitsToKg` on the server, so the figure on screen is the figure
 * that will print.
 */
export function toKg(quantity, unit, product) {
  const base = baseUnitOf(product)
  const kgPerBaseUnit = base ? UNIT_NAME_TO_KG[base.unitName] : undefined
  if (!kgPerBaseUnit) return 0
  return Number((toBaseUnits(quantity, unit) * kgPerBaseUnit).toFixed(3))
}

/** True when this product's weight is meaningful enough to show a kg column. */
export function isWeighed(product) {
  const base = baseUnitOf(product)
  return Boolean(base && UNIT_NAME_TO_KG[base.unitName])
}
