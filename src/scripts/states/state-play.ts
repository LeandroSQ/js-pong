/* eslint-disable max-statements */
import { COMPaddle } from "./../models/com-paddle";
import { Main } from "../main";
import { PlayerPaddle } from "../models/player-paddle";
import { IState } from "./state";
import { Ball } from "../models/ball";
import { Vector } from "../models/vector";
import { Paddle } from "../models/paddle";
import { BALL_RADIUS, FONT_FAMILY, FONT_SIZE, PADDLE_HEIGHT, PADDLE_MARGIN, PADDLE_WIDTH } from "../constants";
import SETTINGS from "../settings";
import { Log } from "../utils/log";
import { Theme } from "../utils/theme";

export class StatePlay implements IState {

	private ball: Ball;
	private paddleA: Paddle;
	private paddleB: Paddle;

	constructor(private main: Main) { }

	// #region Utility
	public get width() {
		return this.main.canvas.width;
	}

	public get height() {
		return this.main.canvas.height;
	}

	public invalidate() {
		this.main.invalidate();
	}

	public requestLayout() {
		if (this.paddleA) this.paddleA.bounds.x = PADDLE_MARGIN;
		if (this.paddleB) this.paddleB.bounds.x = this.main.canvas.width - PADDLE_MARGIN - PADDLE_WIDTH;

		this.invalidate();
	}
	// #endregion

	async setup() {
		Log.debug("StatePlay", "Setting up...");
		this.ball = new Ball(new Vector(this.main.canvas.width / 2 - BALL_RADIUS, this.main.canvas.height / 2 - BALL_RADIUS));
		this.paddleA = new PlayerPaddle({ x: PADDLE_MARGIN, y: this.main.canvas.height / 2 - PADDLE_HEIGHT / 2 });
		this.paddleB = new COMPaddle({ x: this.main.canvas.width - PADDLE_MARGIN - PADDLE_WIDTH, y: this.main.canvas.height / 2 - PADDLE_HEIGHT / 2 }, this.ball);
	}

	async update(deltaTime: number) {
		this.ball.update(deltaTime, this.main.canvas, [this.paddleA, this.paddleB]);
		this.paddleA.update(deltaTime, this.main.canvas);
		this.paddleB.update(deltaTime, this.main.canvas);

		this.invalidate();
	}

	resize() {
		Log.debug("StatePlay", "Resizing...");
		this.requestLayout();
	}

	render(ctx: CanvasRenderingContext2D) {
		this.main.canvas.clear();

		this.main.renderBoard();

		// Draw the scores
		if (this.paddleA.score > 0 || this.paddleB.score > 0) {
			ctx.fillStyle = Theme.foreground;
			ctx.font = `${FONT_SIZE}pt ${FONT_FAMILY}`;
			ctx.fillTextCentered(this.paddleA.score.toString(), this.main.canvas.width / 4, FONT_SIZE + PADDLE_MARGIN);
			ctx.fillTextCentered(this.paddleB.score.toString(), this.main.canvas.width * 3 / 4, FONT_SIZE + PADDLE_MARGIN);
		}

		// Draw the timer
		if (this.ball.timer > 0) {
			ctx.fillStyle = Theme.foreground;
			ctx.font = `${FONT_SIZE}pt ${FONT_FAMILY}`;
			ctx.fillTextCentered(Math.ceil(this.ball.timer).toString(), this.main.canvas.width / 2, FONT_SIZE + PADDLE_MARGIN);
		}

		this.paddleA.render(ctx);
		this.paddleB.render(ctx);
		this.ball.render(ctx);
	}

}