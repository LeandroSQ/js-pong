import { Size } from "../types/size";

export class Sprite {

	private image: HTMLImageElement;
	public size: Size = { width: 0, height: 0 };

	constructor(private url: string, private pixelated: boolean = true, size: Size | undefined = undefined) {
		if (size) this.size = size;
	}

	async setup() {
		this.image = new Image();
		this.image.src = this.url;
		await this.image.decode();
		this.size = { width: this.image.width, height: this.image.height };
	}

	render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number = this.size.width, height: number = this.size.height) {
		ctx.save();
		if (this.pixelated) {
			ctx.imageSmoothingEnabled = false;
			ctx["mozImageSmoothingEnabled"] = false;
			ctx["webkitImageSmoothingEnabled"] = false;
			ctx["msImageSmoothingEnabled"] = false;
			ctx["oImageSmoothingEnabled"] = false;
		}
		
		ctx.drawImage(this.image, x, y, width, height);
		ctx.restore();
	}

}