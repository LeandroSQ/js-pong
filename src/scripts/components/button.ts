import { BORDER, COLOR_SHADOW, UI_SCALING } from "../constants";
import { Rectangle } from "../models/rectangle";
import { renderInnerPanel, renderOutsidePanel } from "../utils/panel";
import { InputHandler, MouseButton } from "./input-handler";

export type OnButtonPressedListener = (source: Button) => void;

export class Button {

	protected bounds: Rectangle;
	protected isDirty = false;
	protected isPressed = false;
	protected isHovered = false;
	private listeners: Array<OnButtonPressedListener> = [];

	public async setup() {
		// Ignore
	}

	public resize(bounds: Rectangle) {
		this.bounds = bounds;
	}

	public update(_deltaTime: number) {
		const mouse = InputHandler.mouse;

		if (this.bounds.contains(mouse)) {
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
			renderInnerPanel(ctx, this.bounds, BORDER * 0.75);
		} else {
			renderOutsidePanel(ctx, this.bounds, BORDER * 0.75);
		}

		if (this.isHovered) {
			// Draw border
			ctx.strokeStyle = COLOR_SHADOW;
			ctx.lineWidth = 1 * UI_SCALING;
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