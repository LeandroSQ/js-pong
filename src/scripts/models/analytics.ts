/* eslint-disable max-statements */
import { Main } from "../main";
import { Rectangle } from "./rectangle";

export class Analytics {

	private readonly padding = 15;
	private readonly lineHeight = 12;
	private readonly maxEntries = 120;

	private lastFrameTime = 0;
	private chart: number[] = [];

	constructor(private main: Main) { }

	public clear() {
		this.chart = [];
	}

	public startFrame() {
		this.lastFrameTime = performance.now();
	}

	public endFrame() {
		const elapsed = performance.now() - this.lastFrameTime;
		this.chart.push(elapsed);

		if (this.chart.length > this.maxEntries) {
			this.chart.shift();
		}
	}

	private calculateBounds(screenWidth: number, screenHeight: number): Rectangle {
		const padding = 15;
		const width = 200;
		const height = 100;

		const x = screenWidth - width - padding;
		const y = padding;

		return new Rectangle(x, y, width, height);
	}

	private renderBackground(ctx: CanvasRenderingContext2D, bounds: Rectangle) {
		ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
		ctx.lineWidth = 0.5;

		ctx.beginPath();
		ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
		ctx.fill();
		ctx.stroke();
	}

	private renderDebugOverlay(ctx: CanvasRenderingContext2D, bounds: Rectangle, average: number, max: number, last: number) {
		const x = bounds.x + this.padding / 2;
		let y = bounds.y + this.padding / 2;

		ctx.fillStyle = "#FFF";
		ctx.font = `${this.lineHeight}px Arial`;
		ctx.textBaseline = "top";

		// Render the title
		ctx.textAlign = "center";
		ctx.fillText("Analytics", bounds.x + bounds.width / 2, y);
		y += this.lineHeight ;

		// Render the values
		ctx.textAlign = "left";
		ctx.fillText(`FPS: ${this.main.fps} / ${this.main.ups}`, x, y);
		y += this.lineHeight;
		ctx.fillText(`Average: ${average.toFixed(2)}`, x, y);
		y += this.lineHeight;
		ctx.fillText(`Max: ${max.toFixed(2)}`, x, y);
		y += this.lineHeight;
		ctx.fillText(`Last: ${last.toFixed(2)}`, x, y);
		y += this.lineHeight;
	}

	private renderChart(ctx: CanvasRenderingContext2D, bounds: Rectangle, max: number, reference: number) {
		const chartX = bounds.x;
		const chartY = bounds.y + this.padding + this.lineHeight * 4.5;
		const maxHeight = bounds.y + bounds.height - chartY - this.padding;
		const width = bounds.width + 1;
		const spacing = width / this.maxEntries;

		// Render the chart
		ctx.strokeStyle = "#FFF";
		ctx.beginPath();
		const logMax = Math.max(max, 0);
		for (let i = 0; i < this.chart.length; i++) {
			const value = Math.max(this.chart[i], 0);
			const peak = value / logMax * maxHeight;
			const x = chartX + i * spacing;
			const y = chartY + maxHeight - peak;

			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.stroke();

		// Draw the reference line
		if (max <= reference) return;

		const referenceHeight = reference / max * maxHeight;
		ctx.strokeStyle = "#F00";
		ctx.beginPath();
		ctx.moveTo(chartX, chartY + maxHeight - referenceHeight);
		ctx.lineTo(chartX + width, chartY + maxHeight - referenceHeight);
		ctx.stroke();
	}

	public render(ctx: CanvasRenderingContext2D) {
		const bounds = this.calculateBounds(ctx.canvas.width, ctx.canvas.height);

		this.renderBackground(ctx, bounds);

		// Calculate the max and average frame time
		const targetFrameTime = 1000 / this.main.targetFPS;
		let maxFrameTime = 0;
		let totalFrameTime = 0;
		let last = 0;
		for (const entry of this.chart) {
			if (entry > maxFrameTime) maxFrameTime = entry;
			totalFrameTime += entry;
			last = entry;
		}
		const averageFrameTime = totalFrameTime / this.chart.length;

		this.renderDebugOverlay(ctx, bounds, averageFrameTime, maxFrameTime, last);

		if (this.chart.length < 2) return;

		this.renderChart(ctx, bounds, maxFrameTime, targetFrameTime);
	}

}