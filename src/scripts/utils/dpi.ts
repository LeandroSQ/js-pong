export abstract class DPI {

	public static get dpi(): number {
		return window.devicePixelRatio ?? 1.0;
	}

	public static fromPx(px: number): number {
		return px * this.dpi;
	}

	public static toPx(dpi: number): number {
		return dpi / this.dpi;
	}

}