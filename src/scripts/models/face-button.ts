import { BORDER } from "../constants";
import { Button } from "./../components/button";
import { Sprite } from "./sprite";

export enum ButtonFace {
	Happy = 0,
	Cool,
	Dead,
	Surprised
}

export class FaceButton extends Button {

	public face: ButtonFace = ButtonFace.Happy;
	private faces = [
		new Sprite("assets/images/face-happy.png", true),
		new Sprite("assets/images/face-cool.png", true),
		new Sprite("assets/images/face-dead.png", true),
		new Sprite("assets/images/face-surprised.png", true),
	];

	constructor() { super(); }

	public async setup() {
		await Promise.all(this.faces.map(face => face.setup()));
	}

	public render(ctx: CanvasRenderingContext2D): void {
		if (!this.isDirty) return;
		super.render(ctx);


		ctx.save();
		if (this.isPressed) ctx.translate(1, 1);

		// Draw face
		const face = this.faces[this.face];
		const size = Math.min(this.bounds.width, this.bounds.height) - BORDER * 2;
		face.render(
			ctx,
			this.bounds.x + this.bounds.width / 2 - size / 2,
			this.bounds.y + this.bounds.height / 2 - size / 2,
			size, size
		);

		ctx.restore();
	}

}