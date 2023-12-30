import { COLOR_HIGHLIGHT, COLOR_SHADOW, COLOR_BASE } from "../constants";
import { Rectangle } from "../models/rectangle";


export function renderOutsidePanel(ctx: CanvasRenderingContext2D, bounds: Rectangle, padding = 2) {
	renderPanel(ctx, bounds, padding, COLOR_HIGHLIGHT, COLOR_SHADOW, COLOR_BASE);
}

export function renderInnerPanel(ctx: CanvasRenderingContext2D, bounds: Rectangle, padding = 2) {
	renderPanel(ctx, bounds, padding, COLOR_SHADOW, COLOR_HIGHLIGHT, COLOR_BASE);
}

export function renderPanel(ctx: CanvasRenderingContext2D, bounds: Rectangle, padding = 2, colorHighlight: string, colorShadow: string, colorBase: string) {
	// Draw highlight as a triangle in the top left corner
	ctx.fillStyle = colorHighlight;
	ctx.beginPath();
	ctx.moveTo(bounds.x, bounds.y);
	ctx.lineTo(bounds.x + bounds.width, bounds.y);
	ctx.lineTo(bounds.x + bounds.width - padding, bounds.y + padding);
	ctx.lineTo(bounds.x + padding, bounds.y + bounds.height - padding);
	ctx.lineTo(bounds.x, bounds.y + bounds.height);
	ctx.closePath();
	ctx.fill();

	// Draw shadow as a triangle in the bottom right corner
	ctx.fillStyle = colorShadow;
	ctx.beginPath();
	ctx.moveTo(bounds.x + bounds.width, bounds.y + bounds.height);
	ctx.lineTo(bounds.x, bounds.y + bounds.height);
	ctx.lineTo(bounds.x + padding, bounds.y + bounds.height - padding);
	ctx.lineTo(bounds.x + bounds.width - padding, bounds.y + padding);
	ctx.lineTo(bounds.x + bounds.width, bounds.y);
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = colorBase;
	ctx.fillRect(bounds.x + padding, bounds.y + padding, bounds.width - padding * 2, bounds.height - padding * 2);
}
