import { createTheme } from '@mui/material/styles'

// Soft, layered shadows instead of MUI's default harsh ones — same 25-entry
// shape the theme expects, scaled up gradually by elevation.
function buildShadows(alpha) {
  const shadows = ['none']
  for (let depth = 1; depth <= 24; depth += 1) {
    const y1 = Math.round(1 + depth * 0.6)
    const blur1 = Math.round(3 + depth * 1.6)
    const y2 = Math.round(1 + depth * 0.3)
    const blur2 = Math.round(2 + depth * 0.9)
    shadows.push(
      `0px ${y1}px ${blur1}px rgba(31, 42, 36, ${alpha}), 0px ${y2}px ${blur2}px rgba(31, 42, 36, ${alpha * 0.6})`,
    )
  }
  return shadows
}

const lightPalette = {
  mode: 'light',
  background: {
    default: '#FBF8F3',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1F2A24',
    secondary: '#5C6B62',
    disabled: '#9AA59D',
  },
  primary: {
    main: '#E8A33D',
    dark: '#C98826',
    light: '#F0BA6A',
    contrastText: '#241B0C',
  },
  success: {
    main: '#2F6D4F',
    dark: '#25573F',
    light: '#4F9070',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#C98A2C',
    dark: '#A97423',
    light: '#DDA855',
    contrastText: '#241B0C',
  },
  error: {
    main: '#C1502E',
    dark: '#A0431F',
    light: '#D07C60',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#5B6B77',
    dark: '#495661',
    light: '#7E8B95',
    contrastText: '#FFFFFF',
  },
  divider: 'rgba(31, 42, 36, 0.08)',
  action: {
    hover: 'rgba(31, 42, 36, 0.04)',
    selected: 'rgba(232, 163, 61, 0.12)',
  },
}

const darkPalette = {
  mode: 'dark',
  background: {
    default: '#14171A',
    paper: '#1B1F23',
  },
  text: {
    primary: '#F2F0EA',
    secondary: '#9CA7A0',
    disabled: '#5E6A64',
  },
  primary: {
    main: '#D9A857',
    dark: '#B98A3F',
    light: '#E3BC7C',
    contrastText: '#1B140A',
  },
  success: {
    main: '#4C9376',
    dark: '#3C7A61',
    light: '#6FAE92',
    contrastText: '#0C1512',
  },
  warning: {
    main: '#C99A54',
    dark: '#A87F41',
    light: '#D6B27D',
    contrastText: '#1B140A',
  },
  error: {
    main: '#C97F63',
    dark: '#A9654B',
    light: '#D69C86',
    contrastText: '#1B0E09',
  },
  info: {
    main: '#8B96A0',
    dark: '#6F7982',
    light: '#A6AFB7',
    contrastText: '#0F1214',
  },
  divider: 'rgba(242, 240, 234, 0.09)',
  action: {
    hover: 'rgba(242, 240, 234, 0.06)',
    selected: 'rgba(217, 168, 87, 0.14)',
  },
}

// Reusable sx fragment: apply to any money/quantity figure so columns align.
export const tabularNums = {
  fontVariantNumeric: 'tabular-nums',
  fontFeatureSettings: '"tnum" 1',
}

export const statusColors = {
  PAID: 'success',
  CLEAR: 'success',
  PARTIAL: 'warning',
  NEAR_LIMIT: 'warning',
  UNPAID: 'error',
  OVER_LIMIT: 'error',
  PENDING: 'info',
}

export function createAppTheme(mode) {
  const palette = mode === 'dark' ? darkPalette : lightPalette
  const shadowAlpha = mode === 'dark' ? 0.45 : 0.08

  const theme = createTheme({
    palette,
    shape: { borderRadius: 14 },
    shadows: buildShadows(shadowAlpha),
    typography: {
      fontFamily: '"Inter", "Manrope", "Segoe UI", sans-serif',
      h1: { fontFamily: '"Manrope", sans-serif', fontWeight: 700, letterSpacing: -0.5 },
      h2: { fontFamily: '"Manrope", sans-serif', fontWeight: 700, letterSpacing: -0.4 },
      h3: { fontFamily: '"Manrope", sans-serif', fontWeight: 700, letterSpacing: -0.3 },
      h4: { fontFamily: '"Manrope", sans-serif', fontWeight: 700 },
      h5: { fontFamily: '"Manrope", sans-serif', fontWeight: 600 },
      h6: { fontFamily: '"Manrope", sans-serif', fontWeight: 600 },
      subtitle1: { fontFamily: '"Manrope", sans-serif', fontWeight: 600 },
      subtitle2: { fontFamily: '"Manrope", sans-serif', fontWeight: 600 },
      button: { fontFamily: '"Manrope", sans-serif', fontWeight: 600, textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 16 },
        },
        defaultProps: { elevation: 0 },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark'
              ? '0px 2px 10px rgba(0,0,0,0.35)'
              : '0px 2px 14px rgba(31,42,36,0.06)',
            border: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
            boxShadow: 'none',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 600 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
            boxShadow: 'none',
            borderBottom: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: palette.background.paper,
            borderRight: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${palette.divider}` },
          head: {
            fontWeight: 700,
            color: palette.text.secondary,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': { backgroundColor: palette.action.hover },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 8, fontSize: '0.75rem' },
        },
      },
    },
  })

  return theme
}
