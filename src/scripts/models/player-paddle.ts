import { Size } from "../types/size";
import { InputHandler, Key } from "./../components/input-handler";
import { Paddle } from "./paddle";

export class PlayerPaddle extends Paddle {

	private enableMouse = true;

	constructor(position) {
		super(position);
	}

	public update(deltaTime: number, screen: Size) {
		if (this.enableMouse) {
			this.bounds.y += ((InputHandler.mouse.y - this.bounds.height / 2) - this.bounds.y);
			if (this.bounds.y < 0) {
				this.bounds.y = 0;
			} else if (this.bounds.y + this.bounds.height > screen.height) {
				this.bounds.y = screen.height - this.bounds.height;
			}
		} else {
			if (InputHandler.isKeyDown(Key.ArrowUp)) {
				this.bounds.y -= this.speed * deltaTime;
				if (this.bounds.y < 0) {
					this.bounds.y = 0;
				}
			}

			if (InputHandler.isKeyDown(Key.ArrowDown)) {
				this.bounds.y += this.speed * deltaTime;
				if (this.bounds.y + this.bounds.height > screen.height) {
					this.bounds.y = screen.height - this.bounds.height;
				}
			}
		}
	}

}