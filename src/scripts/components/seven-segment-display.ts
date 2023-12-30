import { DISPLAY_TEXT_MARGIN } from "./../constants";
import { COLOR_DISPLAY_BACKGROUND, COLOR_HIGHLIGHT, COLOR_SHADOW, DISPLAY_BORDER } from "../constants";
import { renderPanel } from "../utils/panel";
import { Rectangle } from "../models/rectangle";
import { Sprite } from "../models/sprite";

export class SevenSegmentsDisplay {

	private sprites: Array<Sprite> = [
		new Sprite("assets/images/digit0.png"),
		new Sprite("assets/images/digit1.png"),
		new Sprite("assets/images/digit2.png"),
		new Sprite("assets/images/digit3.png"),
		new Sprite("assets/images/digit4.png"),
		new Sprite("assets/images/digit5.png"),
		new Sprite("assets/images/digit6.png"),
		new Sprite("assets/images/digit7.png"),
		new Sprite("assets/images/digit8.png"),
		new Sprite("assets/images/digit9.png"),
		new Sprite("assets/images/digit-negative.png"),
	];

	private isDirty = true;
	private isNegative = false;
	private digits: Array<number> = [];
	private bounds: Rectangle;

	constructor(value: number, public displaySize: number = 3) {
		this.digits = this.separateDigits(value);
	}

	set value(value: number) {
		if (value < 0) {
			this.isNegative = true;
		}

		this.digits = this.separateDigits(Math.abs(value));
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

	public async setup() {
		await Promise.all(this.sprites.map(sprite => sprite.setup()));
	}

	invalidate() {
		this.isDirty = true;
	}

	resize(bounds: Rectangle, _ctx: CanvasRenderingContext2D) {
		this.bounds = bounds;
		this.invalidate();
	}

	render(ctx: CanvasRenderingContext2D) {
		if (!this.isDirty) return;
		this.isDirty = false;

		// Draw bevel border
		renderPanel(
			ctx,
			this.bounds,
			DISPLAY_BORDER,
			COLOR_SHADOW,
			COLOR_HIGHLIGHT,
			COLOR_DISPLAY_BACKGROUND
		);

		// Draw digits
		const width = (this.bounds.width - DISPLAY_BORDER * 2 - DISPLAY_TEXT_MARGIN * 2) / this.displaySize;
		const height = this.bounds.height - DISPLAY_BORDER * 2 - DISPLAY_TEXT_MARGIN * 2;
		for (let i = 0; i < this.displaySize; i++) {
			const digit = this.digits[i];
			let sprite = this.sprites[digit];
			if (i === 0 && this.isNegative) sprite = this.sprites[10];
			const x = this.bounds.x + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN + i * width;
			const y = this.bounds.y + DISPLAY_BORDER + DISPLAY_TEXT_MARGIN;
			sprite.render(ctx, x, y, width, height);
		}
	}

}