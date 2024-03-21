import { PADDLE_HEIGHT, PADDLE_WIDTH } from "./../constants";
import { Vector } from "./vector";
import { Theme } from "../utils/theme";
import { Rectangle } from "./rectangle";
import { Size } from "../types/size";

export class Paddle {

	public bounds = new Rectangle(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
	public score = 0;

	constructor(position: Vector) {
		this.bounds.position = position;
	}

	public update(deltaTime: number, screen: Size) {
		// Ignore
	}

	public render(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = Theme.foreground;
		ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	}

}