import { COLOR_SHADOW, CELL_BORDER } from "../constants";
import { renderOutsidePanel } from "../utils/panel";
import { Rectangle } from "./rectangle";
import { Sprite } from "./sprite";
import { Vector } from "./vector";

export class Cell {

	private static spriteMine = new Sprite("assets/images/mine.png", true);
	private static spriteFlag = new Sprite("assets/images/flag.png", true);
	private static spriteNumbers = [
		new Sprite("assets/images/number1.png", true),
		new Sprite("assets/images/number2.png", true),
		new Sprite("assets/images/number3.png", true),
		new Sprite("assets/images/number4.png", true),
		new Sprite("assets/images/number5.png", true),
		new Sprite("assets/images/number6.png", true),
		new Sprite("assets/images/number7.png", true),
		new Sprite("assets/images/number8.png", true),
	];

	public isBomb = false;
	public isFlagged = false;
	public isRevealed = false;
	public isHighlighted = false;
	public neighbors = 0;

	constructor(public x: number, public y: number) {}

	public static async setup() {
		await Promise.all(Cell.spriteNumbers.map(sprite => sprite.setup()));
		await Cell.spriteFlag.setup();
		await Cell.spriteMine.setup();
	}

	get position() {
		return new Vector(this.x, this.y);
	}

	render(ctx: CanvasRenderingContext2D, bounds: Rectangle) {
		// Setup font


		if (this.isHighlighted) {
			// Render highlighted cell
			ctx.fillStyle = "rgba(255, 0, 0, 1)";
			ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
		}

		if (this.isRevealed) {
			// Render revealed cell
			ctx.strokeStyle = COLOR_SHADOW;
			ctx.lineWidth = 1;
			ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

			// Render content
			if (this.isBomb) {
				Cell.spriteMine.render(ctx, bounds.x, bounds.y, bounds.width, bounds.height);
			} else if (this.neighbors > 0) {
				const sprite = Cell.spriteNumbers[this.neighbors - 1];
				sprite.render(ctx, bounds.x, bounds.y, bounds.width, bounds.height);
			}
		} else {
			// Render like a button
			renderOutsidePanel(ctx, bounds, CELL_BORDER);

			// Render content
			if (this.isFlagged) {
				Cell.spriteFlag.render(ctx, bounds.x, bounds.y, bounds.width, bounds.height);
				// ctx.fillStyle = "black";
				// ctx.fillText("`", bounds.center.x, bounds.center.y);
			} else if (DEBUG && this.isBomb) {
				// DEBUG: Render bombs ghost
				ctx.font = `${Math.average(bounds.width, bounds.height) / 2}px 'Mine-sweeper'`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
				ctx.fillText("*", bounds.center.x, bounds.center.y);
			}
		}
	}

}
