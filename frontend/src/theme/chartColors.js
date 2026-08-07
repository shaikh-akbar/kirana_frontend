// Chart-only color tokens, validated with the dataviz palette validator
// (CVD-safe adjacent pair, lightness-band compliant on both surfaces).
// Kept separate from the MUI theme palette because chart series need exact
// lightness bands per mode that don't always match the UI accent shades.
export function getChartColors(mode) {
  if (mode === 'dark') {
    return {
      retail: '#3987E5',
      wholesale: '#B98A3F',
      neutralLine: '#9CA7A0',
      grid: 'rgba(242, 240, 234, 0.09)',
      axis: '#5E6A64',
    }
  }
  return {
    retail: '#2A78D6',
    wholesale: '#E8A33D',
    neutralLine: '#5C6B62',
    grid: 'rgba(31, 42, 36, 0.08)',
    axis: '#9AA59D',
  }
}
