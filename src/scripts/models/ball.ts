import { Color } from './../utils/color';
/* eslint-disable complexity */
import { AUDIO_DURATION, AUDIO_BOUNCE_HZ, AUDIO_SCORE_HZ, AUDIO_TIMER_HZ, BALL_RADIUS, BALL_SPEED, BALL_TIMER } from "../constants";
import SETTINGS from "../settings";
import { Rectangle } from "./rectangle";
import { Vector } from "./vector";
import { Size } from "./../types/size";
import { Paddle } from "./paddle";
import { AudioSynth } from "../utils/audio";
import { Theme } from "../utils/theme";

export class Ball {

	public bounds = new Rectangle(0, 0, BALL_RADIUS * 2, BALL_RADIUS * 2);
	public velocity = new Vector(0, 0);
	public timer = BALL_TIMER;
	private lastTimer = 0;

	constructor(position: Vector) {
		this.bounds.position = position;
		this.velocity = new Vector(0, 0);
	}

	private reset(screen: Size) {
		this.timer = BALL_TIMER;
		this.bounds.x = screen.width / 2 - this.bounds.width / 2;
		this.bounds.y = screen.height / 2 - this.bounds.height / 2;
	}

	private bounceOffPaddles(paddles: Array<Paddle>, screen: Size) {
		// Bounce off paddles
		for (const paddle of paddles) {
			if (this.bounds.intersects(paddle.bounds)) {
				const paddleSidePlacement = paddle.bounds.x < screen.width / 2;// true if left, false if right
				const isBallMovingTowardsPaddle = paddleSidePlacement ? this.velocity.x < 0 : this.velocity.x > 0;
				if (isBallMovingTowardsPaddle) {
					this.velocity.x *= -1;
					this.playSound(AUDIO_BOUNCE_HZ);
					SETTINGS.DIFFICULTY *= 1.01;
				}
			}
		}
	}

	private playSound(hertz: number) {
		AudioSynth.play(hertz, AUDIO_DURATION * (1.0 + Math.random() * 0.8 - 0.4));
	}

	private bounceOffWalls(paddles: Array<Paddle>, screen: Size) {
		// Bounce off screen edges
		if (this.bounds.x < 0 && this.velocity.x < 0) {
			this.bounds.x = 0;
			this.velocity.x *= -1;
			this.playSound(AUDIO_SCORE_HZ);
			SETTINGS.DIFFICULTY = 1.0;
			paddles[1].score++;
			this.reset(screen);
		} else if (this.bounds.x + this.bounds.width > screen.width && this.velocity.x > 0) {
			this.bounds.x = screen.width - this.bounds.width;
			this.velocity.x *= -1;
			this.playSound(AUDIO_SCORE_HZ);
			paddles[0].score++;
			this.reset(screen);
			SETTINGS.DIFFICULTY = 1.0;
		}

		if (this.bounds.y < 0 && this.velocity.y < 0) {
			this.bounds.y = 0;
			this.velocity.y *= -1;
			this.playSound(AUDIO_BOUNCE_HZ);
		} else if (this.bounds.y + this.bounds.height > screen.height && this.velocity.y > 0) {
			this.bounds.y = screen.height - this.bounds.height;
			this.velocity.y *= -1;
			this.playSound(AUDIO_BOUNCE_HZ);
		}
	}

	private updateTimer(deltaTime: number) {
		this.timer -= deltaTime;
		if (this.timer <= 0) {
			this.velocity = new Vector(
				Math.random() < 0.5 ? -BALL_SPEED : BALL_SPEED,
				Math.random() < 0.5 ? -BALL_SPEED : BALL_SPEED
			);
		}

		// Play sound countdown
		if (Math.floor(this.timer) !== this.lastTimer) {
			this.lastTimer = Math.floor(this.timer);
			this.playSound(AUDIO_TIMER_HZ * (BALL_TIMER - this.timer + 1));
		}
	}

	public update(deltaTime: number, screen: Size, paddles: Array<Paddle>) {
		if (this.timer > 0) {
			this.updateTimer(deltaTime);

			return;
		}

		// Update velocity
		this.bounds.x += this.velocity.x * SETTINGS.DIFFICULTY * deltaTime;
		this.bounds.y += this.velocity.y * SETTINGS.DIFFICULTY * deltaTime;

		this.bounceOffWalls(paddles, screen);
		this.bounceOffPaddles(paddles, screen);
	}

	public render(ctx: CanvasRenderingContext2D) {
		if (this.timer > 0) ctx.fillStyle = Color.alpha(Theme.foreground, Math.sin(this.timer * (Math.PI * 2) * 1.20) * 0.25 + 0.75);
		else ctx.fillStyle = Theme.foreground;
		
		ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	}

}