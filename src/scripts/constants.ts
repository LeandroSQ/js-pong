import { Difficulty } from './types/difficulty';

export const DIFFICULTIES: { EASY: Difficulty, MEDIUM: Difficulty, HARD: Difficulty } = {
	EASY: {
		columns: 9,
		rows: 9,
		bombs: 10,
		name: "Easy"
	},
	MEDIUM: {
		columns: 16,
		rows: 16,
		bombs: 40,
		name: "Medium"
	},
	HARD: {
		columns: 30,
		rows: 16,
		bombs: 99,
		name: "Hard"
	}
};

export const BOMB_PLACE_AVOIDANCE_RADIUS = 3;

export const FONT_FAMILY = "7Segments";

export const UI_SCALING = 2;
export const PADDING = 10 * UI_SCALING;
export const BORDER = 3 * UI_SCALING;
export const DISPLAY_BORDER = 1 * UI_SCALING;
export const DISPLAY_MARGIN = 3 * UI_SCALING;
export const DISPLAY_TEXT_MARGIN = 2 * UI_SCALING;
export const CELL_BORDER = 2 * UI_SCALING;
export const DEFAULT_CELL_SIZE = 20 * UI_SCALING;
export const HEADER_HEIGHT = DEFAULT_CELL_SIZE * 2;

/* Panel */
export const COLOR_BASE = "rgb(184, 184, 184)";
export const COLOR_HIGHLIGHT = "rgb(255, 255, 255)";
export const COLOR_SHADOW = "rgb(117, 117, 117)";

/* Displays */
export const COLOR_DISPLAY_BACKGROUND = "rgb(0, 0, 0)";
export const COLOR_DISPLAY_DIGIT_OFF = "rgb(99, 0, 6)";
export const COLOR_DISPLAY_DIGIT_ON = "rgb(255, 0, 15)";

/* Cells */
export const COLOR_CELL_1 = "rgb(0, 0, 254)";
export const COLOR_CELL_2 = "rgb(0, 119, 7)";
export const COLOR_CELL_3 = "rgb(255, 0, 10)";
export const COLOR_CELL_4 = "rgb(0, 0, 116)";
export const COLOR_CELL_5 = "rgb(121, 0, 5)";
export const COLOR_CELLS = [COLOR_CELL_1, COLOR_CELL_2, COLOR_CELL_3, COLOR_CELL_4, COLOR_CELL_5];