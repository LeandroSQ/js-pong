import { Rectangle } from "../models/rectangle";
import { Cursor, CursorType } from "../utils/cursor";
import { DPI } from "../utils/dpi";
import { InputHandler, MouseButton } from "./input-handler";

export type OnButtonPressedListener = (source: Button) => void;

export class Button {

	protected bounds: Rectangle;
	protected isDirty = true;
	protected isPressed = false;
	protected isHovered = false;
	private listeners: Array<OnButtonPressedListener> = [];

	constructor(public text: string) {  }

	public async setup() {
		// Ignore
	}

	public resize(bounds: Rectangle) {
		this.bounds = bounds;
	}

	public update(_deltaTime: number) {
		const mouse = InputHandler.mouse;

		if (this.bounds.contains(mouse)) {
			Cursor.set(CursorType.Pointer);
			if (!this.isHovered) this.invalidate();
			this.isHovered = true;

			if (InputHandler.isMouseButtonDown(MouseButton.Left)) {
				if (!this.isPressed) this.invalidate();
				this.isPressed = true;
			} else {
				if (this.isPressed) {
					this.invalidate();
					for (const listener of this.listeners) listener(this);
				}
				this.isPressed = false;
			}
		} else {
			if (this.isPressed || this.isHovered) this.invalidate();
			this.isPressed = false;
			this.isHovered = false;
		}
	}

	public render(ctx: CanvasRenderingContext2D) {
		if (!this.isDirty) return;
		this.isDirty = false;

		if (this.isPressed) {
			// Draw background
			ctx.fillStyle = "#ccc";
			ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
		} else {
			// Draw background
			ctx.fillStyle = "#eee";
			ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
		}

		// Draw text
		ctx.fillStyle = "#000";
		ctx.font = "12pt";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(this.text, this.bounds.x + this.bounds.width / 2, this.bounds.y + this.bounds.height / 2);


		if (this.isHovered) {
			// Draw border
			ctx.strokeStyle = "#ccc";
			ctx.lineWidth = DPI.dpi;
			ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
		}
	}

	public addOnButtonPressedListener(listener: OnButtonPressedListener) {
		this.listeners.push(listener);
	}

	invalidate() {
		this.isDirty = true;
	}

}