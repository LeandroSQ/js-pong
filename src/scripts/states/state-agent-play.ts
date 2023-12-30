import { StatePlay } from "./state-play";
import { Vector } from "../models/vector";
import { Log } from "../utils/log";
import { Gizmo } from "../utils/gizmo";
import { Rectangle } from "../models/rectangle";
import { BORDER } from "../constants";
import { Cell } from "../models/cell";
import { Optional } from "../types/optional";

enum AgentState {
	Idle,
	Running,
	Lost,
	Won
};

type HeatMap = {
	values: Array<Array<number>>;
	counts: Array<Array<number>>;
	min: number;
	minPosition: Vector;
	max: number;
	maxPosition: Vector;
};

export class StateAgentPlay extends StatePlay {

	private debug = false;

	private state: AgentState = AgentState.Idle;

	private heatmap: Optional<HeatMap> = null;

	private flaggedCells: Array<Vector> = [];

	public async setup() {
		await super.setup();

		this.state = AgentState.Idle;
		Log.debug("StateAgentPlay", "Starting agent...");
	}

	async handleInput(deltaTime: number) {
		await Promise.delay(1500);
		switch (this.state) {
			case AgentState.Idle:
				// const startPosition = new Vector(Math.randomInt(0, this.grid.columns - 1), Math.randomInt(0, this.grid.rows - 1));

				// Randomly select a cell on a corner
				const corners = [
					new Vector(0, 0),
					new Vector(this.grid.columns - 1, 0),
					new Vector(0, this.grid.rows - 1),
					new Vector(this.grid.columns - 1, this.grid.rows - 1),
				];
				const startPosition = corners[Math.randomInt(0, corners.length - 1)];

				Log.debug("StateAgentPlay", `Grid size is ${this.grid.columns} x ${this.grid.rows}`);
				Log.debug("StateAgentPlay", `Start position is ${startPosition}`);
				this.mark(startPosition);
				this.start(startPosition);
				this.state = AgentState.Running;
				break;

			case AgentState.Running:
				if (this.debug) Log.debug("StateAgentPlay", "Finding best move...");
				if (this.heatmap != null) this.findBestMove();
				this.createHeatMap();
				break;

			case AgentState.Lost:
				break;

			case AgentState.Won:
				break;
		}
	}

	findBestMove() {
		if (this.heatmap === null) return;

		const scoreForReveal = this.heatmap.min / 5;
		const scoreForFlag = this.heatmap.max / 30;

		/* if (scoreForFlag < 0 && scoreForReveal < 0) {
			Log.debug("StateAgentPlay", "No good move found. Randomly selecting a cell...");
			const unrevealed = this.grid.filterCells(x => !x.isRevealed && !x.isFlagged);
			const randomCell = unrevealed[Math.randomInt(0, unrevealed.length - 1)];
			if (!randomCell) throw new Error("Invalid cell");

			this.mark(randomCell.position, "yellow");

			this.grid.clearCells(randomCell.position);

			// Check if the game is over
			if (this.grid.isBomb(randomCell.position)) {
				Log.warn("StateAgentPlay", "Game over!");
			}
		} else */ if (scoreForFlag > scoreForReveal && this.grid.flaggedCount < this.difficulty.bombs) {
			if (this.debug) Log.debug("StateAgentPlay", `Flagging ${this.heatmap.maxPosition} for ${scoreForFlag} over ${scoreForReveal}`);
			const maxCell = this.grid.getCell(this.heatmap.maxPosition);
			if (!maxCell) throw new Error("Invalid cell");

			this.mark(maxCell.position, "green");

			this.grid.toggleFlag(this.heatmap.maxPosition);

			if (!this.grid.isBomb(this.heatmap.maxPosition)) {
				Log.warn("StateAgentPlay", "Wrong flag!");
			}
		} else {
			if (this.debug) Log.debug("StateAgentPlay", `Revealing ${this.heatmap.minPosition} for ${scoreForReveal} over ${scoreForFlag}`);
			const minCell = this.grid.getCell(this.heatmap.minPosition);
			if (!minCell) throw new Error("Invalid cell");

			this.mark(minCell.position, "red");

			this.grid.clearCells(this.heatmap.minPosition);

			// Check if the game is over
			if (this.grid.isBomb(this.heatmap.minPosition)) {
				Log.warn("StateAgentPlay", "Game over!");
			}
		}
	}

	public render(ctx: CanvasRenderingContext2D): void {
		super.invalidate();
		super.render(ctx);

		if (this.heatmap === null) return;

		ctx.save();
		// ctx.filter = "blur(10px)";

		for (let row = 0; row < this.grid.rows; row++) {
			for (let col = 0; col < this.grid.columns; col++) {
				const cell = this.grid.getCell(col, row);
				if (!cell) throw new Error("Invalid cell");

				if (cell.isRevealed || cell.isFlagged) continue;

				const value = this.heatmap.values[row][col];
				// if (value === 0) continue;

				ctx.fillStyle = this.getHeatMapColor(col, row);
				if (this.heatmap.minPosition.x == col && this.heatmap.minPosition.y == row) ctx.fillStyle = "brown";
				else if (this.heatmap.maxPosition.x == col && this.heatmap.maxPosition.y == row) ctx.fillStyle = "brown";

				ctx.beginPath();
				ctx.fillRect(this.boardBounds.x + BORDER + col * this.cellSize, this.boardBounds.y + BORDER + row * this.cellSize, this.cellSize, this.cellSize);

				if (cell.isBomb) {
					ctx.strokeStyle = "white";
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.strokeRect(this.boardBounds.x + BORDER + col * this.cellSize, this.boardBounds.y + BORDER + row * this.cellSize, this.cellSize, this.cellSize);
				}

				if (value != 0) {
					ctx.fillStyle = "black";
					ctx.font = "bold 10pt Roboto";
					ctx.textBaseline = "middle";
					ctx.textAlign = "center";
					ctx.fillText(value.toFixed(2), this.boardBounds.x + BORDER + col * this.cellSize + this.cellSize / 2, this.boardBounds.y + BORDER + row * this.cellSize + this.cellSize / 2);
				}
			}
		}

		ctx.restore();
	}

	private getHeatMapColor(col, row) {
		if (this.heatmap === null) return "black";

		const value = this.heatmap.values[row][col];
		const min = this.heatmap.min;
		const max = this.heatmap.max;

		const ratio = (value - min) / (max - min);
		const hue = (1 - ratio) * 120;

		return `hsla(${hue}, 100%, 50%, 0.5)`;
	}

	private createHeatMap() {
		this.heatmap = {
			values: [],
			counts: [],
			min: Number.MAX_SAFE_INTEGER,
			minPosition: new Vector(0, 0),
			max: Number.MIN_SAFE_INTEGER,
			maxPosition: new Vector(0, 0),
		};

		for (let row = 0; row < this.grid.rows; row++) {
			this.heatmap.values[row] = [];
			this.heatmap.counts[row] = [];
			for (let col = 0; col < this.grid.columns; col++) {
				this.heatmap.values[row][col] = 0;
				this.heatmap.counts[row][col] = 0;
			}
		}

		const visited: Array<Cell> = [];
		const revealed = this.grid.filterCells(x => x.isRevealed && !x.isFlagged);
		for (const cell of revealed) {
			const neighbors = this.grid.getNeighbors(cell.position);
			const flaggedCount = neighbors.filter(x => x.isFlagged).length;
			for (const neighbor of neighbors) {
				if (neighbor.isRevealed || neighbor.isFlagged) continue;

				visited.push(neighbor);

				this.heatmap.values[neighbor.y][neighbor.x] += cell.neighbors - flaggedCount;
				this.heatmap.counts[neighbor.y][neighbor.x]++;
			}
		}

		for (const cell of visited) {
			const neighborTopLeft = this.grid.getCell(cell.x - 1, cell.y - 1);
			const neighborTop = this.grid.getCell(cell.x, cell.y - 1);
			const neighborTopRight = this.grid.getCell(cell.x + 1, cell.y - 1);
			const neighborLeft = this.grid.getCell(cell.x - 1, cell.y);
			const neighborRight = this.grid.getCell(cell.x + 1, cell.y);
			const neighborBottomLeft = this.grid.getCell(cell.x - 1, cell.y + 1);
			const neighborBottom = this.grid.getCell(cell.x, cell.y + 1);
			const neighborBottomRight = this.grid.getCell(cell.x + 1, cell.y + 1);

			const unrevealedCount = [neighborTopLeft, neighborTop, neighborTopRight, neighborLeft, neighborRight, neighborBottomLeft, neighborBottom, neighborBottomRight].filter(x => !x?.isRevealed).length;
			const diagonal = neighborTopLeft?.isRevealed || neighborTopRight?.isRevealed || neighborBottomLeft?.isRevealed || neighborBottomRight?.isRevealed;
			const horizontal = neighborTop?.isRevealed || neighborBottom?.isRevealed;
			const vertical = neighborLeft?.isRevealed || neighborRight?.isRevealed;

			// Check if the cell is a corner
			// if (diagonal && !horizontal && !vertical) {
			// 	this.heatmap.values[cell.y][cell.x] *= 4 - unrevealedCount;
			// }

			// this.heatmap.values[cell.y][cell.x] /= this.heatmap.counts[cell.y][cell.x];

			// Update min and max
			const value = this.heatmap.values[cell.y][cell.x];
			if (value >= 0 && value < this.heatmap.min) {
				this.heatmap.min = value;
				this.heatmap.minPosition = cell.position;
			}
			if (value > this.heatmap.max) {
				this.heatmap.max = value;
				this.heatmap.maxPosition = cell.position;
			}
		}
	}

	private mark(position: Vector, color = "red") {
		Gizmo.outline(
			new Rectangle(
				this.boardBounds.x + BORDER + position.x * this.cellSize,
				this.boardBounds.y + BORDER + position.y * this.cellSize,
				this.cellSize,
				this.cellSize
			),
			color
		);
	}

}
