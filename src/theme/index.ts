import { COLORS } from './color';
import { fontSans, fontMono, FONTS } from './font';

export * from './color';
export * from './font';

export const theme = {
    colors: COLORS,
    fonts: FONTS,
} as const;

export default theme;
