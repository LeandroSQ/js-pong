import { InputHandler, MouseButton } from "../components/input-handler";
import { BALL_RADIUS, FONT_FAMILY, FONT_SIZE, PADDLE_HEIGHT, PADDLE_MARGIN, PADDLE_WIDTH } from "../constants";
import { Main } from "../main";
import { Ball } from "../models/ball";
import { COMPaddle } from "../models/com-paddle";
import { Paddle } from "../models/paddle";
import { Vector } from "../models/vector";
import { Color } from "../utils/color";
import { Theme } from "../utils/theme";
import { IState } from "./state";
import { StatePlay } from "./state-play";

export class StateMenu implements IState {

	private ball: Ball;
	private paddleA: Paddle;
	private paddleB: Paddle;

	constructor(private main: Main) {  }

	async setup() {
		this.ball = new Ball(new Vector(this.main.canvas.width / 2 - BALL_RADIUS, this.main.canvas.height / 2 - BALL_RADIUS));
		this.paddleA = new COMPaddle({ x: PADDLE_MARGIN, y: this.main.canvas.height / 2 - PADDLE_HEIGHT / 2 }, this.ball);
		this.paddleB = new COMPaddle({ x: this.main.canvas.width - PADDLE_MARGIN - PADDLE_WIDTH, y: this.main.canvas.height / 2 - PADDLE_HEIGHT / 2 }, this.ball);
	}

	async update(deltaTime: number) {
		this.main.invalidate();

		this.ball.update(deltaTime, this.main.canvas, [this.paddleA, this.paddleB]);
		this.paddleA.update(deltaTime, this.main.canvas);
		this.paddleB.update(deltaTime, this.main.canvas);

		if (InputHandler.isMouseButtonDown(MouseButton.Left)) {
			this.main.setState(new StatePlay(this.main));
		}
	}

	resize() {
		if (this.paddleA) this.paddleA.bounds.x = PADDLE_MARGIN;
		if (this.paddleB) this.paddleB.bounds.x = this.main.canvas.width - PADDLE_MARGIN - PADDLE_WIDTH;
	}

	render(ctx: CanvasRenderingContext2D) {
		this.main.canvas.clear();

		ctx.save();
		ctx.globalAlpha = Theme.isDark ? 0.15 : 0.25;
		ctx.filter = "blur(2.5px)";
		this.main.renderBoard();
		this.paddleA.render(ctx);
		this.paddleB.render(ctx);
		this.ball.render(ctx);
		ctx.restore();

		ctx.save();
		ctx.font = `${FONT_SIZE}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Theme.foreground;
		ctx.shadowColor = Theme.containerShadow;
		ctx.shadowBlur = 10;
		ctx.shadowOffsetY = 2.5;
		ctx.fillTextCentered("PONG", this.main.canvas.width / 2, this.main.canvas.height / 2 - FONT_SIZE);
		ctx.font = `${FONT_SIZE / 2}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Color.alpha(Theme.foreground, Math.oscilate(Date.now() / 1000.0, 0.5, 0.25, 1.0));
		ctx.fillTextCentered("Click to start", this.main.canvas.width / 2, this.main.canvas.height / 2);
		ctx.restore();
	}

}