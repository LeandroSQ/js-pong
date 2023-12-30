import { DISPLAY_TEXT_MARGIN, FONT_FAMILY } from "./../constants";
import { COLOR_DISPLAY_BACKGROUND, COLOR_DISPLAY_DIGIT_OFF, COLOR_DISPLAY_DIGIT_ON, COLOR_HIGHLIGHT, COLOR_SHADOW, DISPLAY_BORDER } from "../constants";
import { renderPanel } from "../utils/panel";
import { Rectangle } from "../models/rectangle";
import { Vector } from "./../models/vector";

export class SevenSegmentsDisplayCopy {

	private isDirty = true;
	private digits: Array<number> = [];
	private bounds: Rectangle;
	private textOffset: Vector = Vector.zero;
	private fontSize: number;

	constructor(value: number, public displaySize: number = 3) {
		this.digits = this.separateDigits(value);
	}

	set value(value: number) {
		this.digits = this.separateDigits(value);
		this.invalidate();
	}

	get value() {
		return parseInt(this.digits.join(""));
	}

	private get offText() {
		return "8".repeat(this.displaySize);
	}

	private separateDigits(value: number, fill = "0") {
		return value.toString().padStart(this.displaySize, fill).split("").map(digit => parseInt(digit));
	}

	invalidate() {
		this.isDirty = true;
	}

	resize(bounds: Rectangle, ctx: CanvasRenderingContext2D) {
		this.bounds = bounds;
		this.invalidate();

		// Calculate minimum size
		this.fontSize = Math.min(bounds.width * 0.6, bounds.height) - DISPLAY_BORDER * 2 - DISPLAY_TEXT_MARGIN * 2;

		// Setup font
		ctx.font = `${this.fontSize}px '${FONT_FAMILY}'`;

		// Measure text
		const metrics = ctx.measureText(this.offText);
		const width = metrics.width;
		const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

		// Calculate text offset
		this.textOffset = new Vector(
			(bounds.width - DISPLAY_BORDER * 2 - DISPLAY_TEXT_MARGIN * 2) / 2 - width / 2,
			(bounds.height - DISPLAY_BORDER * 2 - DISPLAY_TEXT_MARGIN * 2) / 2 - height / 2
		);
	}

	render(ctx: CanvasRenderingContext2D) {
		if (!this.isDirty) return;
		this.isDirty = false;

		ctx.font = `${this.fontSize}px '${FONT_FAMILY}'`;
		ctx.textAlign = "left";
		ctx.textBaseline = "top";

		this.renderBackground(ctx);
		this.renderDigitsBackground(ctx);
		this.renderDigits(ctx);
	}

	private renderBackground(ctx: CanvasRenderingContext2D) {
		// Draw bevel border
		renderPanel(
			ctx,
			this.bounds,
			DISPLAY_BORDER,
			COLOR_SHADOW,
			COLOR_HIGHLIGHT,
			COLOR_DISPLAY_BACKGROUND
		);
	}

	private renderDigitsBackground(ctx: CanvasRenderingContext2D) {
		// Draw digits background
		ctx.fillStyle = COLOR_DISPLAY_DIGIT_OFF;
		ctx.fillText(this.offText, this.bounds.x + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN + this.textOffset.x, this.bounds.y + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN + this.textOffset.y);

		// Draw diagonal lines, spacing is 1 pixel between lines, creating a checkerboard pattern
		ctx.save();
		ctx.beginPath();
		ctx.rect(this.bounds.x + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN, this.bounds.y + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN, this.bounds.width - DISPLAY_BORDER * 2 - DISPLAY_TEXT_MARGIN * 2, this.bounds.height - DISPLAY_BORDER * 2 - DISPLAY_TEXT_MARGIN * 2);
		ctx.clip();
		ctx.strokeStyle = COLOR_DISPLAY_BACKGROUND;
		ctx.lineWidth = 0.5;
		for (let i = -this.bounds.width / 2; i < this.bounds.width; i += 2) { // Direction is /
			const x = this.bounds.x + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN + i;
			ctx.beginPath();
			ctx.moveTo(
				x,
				this.bounds.y + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN
			);
			ctx.lineTo(
				x + this.bounds.height - DISPLAY_BORDER * 2 - DISPLAY_TEXT_MARGIN * 2,
				this.bounds.y + this.bounds.height - DISPLAY_BORDER - DISPLAY_TEXT_MARGIN
			);
			ctx.stroke();
		}
		for (let i = -this.bounds.width / 2; i < this.bounds.width; i += 2) { // Direction is \
			const x = this.bounds.x + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN + i;
			ctx.beginPath();
			ctx.moveTo(
				x,
				this.bounds.y + this.bounds.height - DISPLAY_BORDER - DISPLAY_TEXT_MARGIN
			);
			ctx.lineTo(
				x + this.bounds.height - DISPLAY_BORDER * 2 - DISPLAY_TEXT_MARGIN * 2,
				this.bounds.y + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN
			);
			ctx.stroke();
		}
		ctx.restore();
	}

	private renderDigits(ctx: CanvasRenderingContext2D) {
		// Draw digits
		ctx.fillStyle = COLOR_DISPLAY_DIGIT_ON;
		ctx.fillText(this.value.toString().padStart(this.displaySize, "0"), this.bounds.x + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN + this.textOffset.x, this.bounds.y + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN + this.textOffset.y);
	}

}