const lightness = {
  black: 0,
  offBlack: 6.25,
  graphite: 12.5,
  stroke: 18.75,
  quiet: 43.75,
  muted: 68.75,
  line: 84.375,
  wash: 90.625,
  panel: 95.3125,
  paper: 98.4375,
  white: 100,
} as const;

const mono = (value: number) => `hsl(0 0% ${value}%)`;

export const themeTokens = {
  accent: null,
  borderWidth: "2px",
  brutalistRadius: "0rem",
  lightness,
  palette: {
    dark: {
      accent: mono(lightness.wash),
      background: mono(lightness.offBlack),
      border: mono(lightness.stroke),
      foreground: mono(lightness.paper),
      muted: mono(lightness.graphite),
      mutedForeground: mono(lightness.muted),
    },
    light: {
      accent: mono(lightness.wash),
      background: mono(lightness.paper),
      border: mono(lightness.line),
      foreground: mono(lightness.offBlack),
      muted: mono(lightness.panel),
      mutedForeground: mono(lightness.quiet),
    },
  },
} as const;
