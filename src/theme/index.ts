import { COLORS } from './color';
import { FONTS } from './font';
import { TOKENS } from './tokens';

export * from './color';
export * from './font';
export * from './tokens';

export const theme = {
    colors: COLORS,
    fonts: FONTS,
    tokens: TOKENS,
} as const;

export default theme;
