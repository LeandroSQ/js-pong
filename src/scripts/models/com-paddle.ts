/* eslint-disable complexity */
/* eslint-disable max-statements */
import { BALL_RADIUS, PADDLE_MARGIN, PADDLE_SPEED } from "../constants";
import { Size } from "../types/size";
import { Gizmo } from "../utils/gizmo";
import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { Vector } from "./vector";
import SETTINGS from "../settings";

export class COMPaddle extends Paddle {

	constructor(position, private ball: Ball) {
		super(position);
	}

	private moveToCenter(deltaTime: number, screen: Size) {
		const target = screen.height / 2 - this.bounds.height / 2;
		this.bounds.y = Math.lerp(this.bounds.y, target, deltaTime * PADDLE_SPEED * SETTINGS.DIFFICULTY);
	}

	public update(deltaTime: number, screen: Size) {
		if (this.ball.timer > 0) {
			this.moveToCenter(deltaTime, screen);

			return;
		}

		const velocity = this.ball.velocity.multiply(SETTINGS.DIFFICULTY);

		// I don't know in which side of the screen the paddle is
		// so I need to check the ball's velocity
		const paddleSidePlacement = this.bounds.x < screen.width / 2;// true if left, false if right
		const isBallMovingTowardsPaddle = paddleSidePlacement ? velocity.x > 0 : velocity.x < 0;

		if (isBallMovingTowardsPaddle) {
			this.moveToCenter(deltaTime, screen);
		} else {
			// Predict the time it will take for the ball to reach the paddle
			const predictedX = this.ball.bounds.x + this.ball.bounds.width;
			const time = (this.bounds.x - predictedX) / velocity.x;
			let predictedY = this.ball.bounds.y + velocity.y * time;

			// The ball will bounce, so we need to calculate the new predicted position
			for (let count = 0; (predictedY < 0 || predictedY + this.ball.bounds.height > screen.height) && count < 10; count++) {
				if (predictedY < 0) {
					Gizmo.circle(new Vector(predictedX - BALL_RADIUS, BALL_RADIUS), BALL_RADIUS, "rgba(255, 0, 0, 0.25)");
					predictedY = -predictedY;
				}
				if (predictedY + this.ball.bounds.height > screen.height) {
					Gizmo.circle(new Vector(predictedX - BALL_RADIUS, screen.height - this.ball.bounds.height), BALL_RADIUS, "rgba(255, 0, 0, 0.25)");
					predictedY = screen.height - this.ball.bounds.height - (predictedY - screen.height + this.ball.bounds.height);
				}
			}


			Gizmo.circle(new Vector(predictedX - BALL_RADIUS, predictedY - BALL_RADIUS), BALL_RADIUS, "red");

			// Move the paddle to the predicted position
			const target = predictedY - (this.bounds.height / 2);
			this.bounds.y = Math.lerp(this.bounds.y, target, deltaTime * PADDLE_SPEED * SETTINGS.DIFFICULTY);
		}

		if (this.bounds.y < PADDLE_MARGIN) {
			this.bounds.y = PADDLE_MARGIN;
		} else if (this.bounds.y + this.bounds.height + PADDLE_MARGIN > screen.height) {
			this.bounds.y = screen.height - this.bounds.height - PADDLE_MARGIN;
		}
	}


}