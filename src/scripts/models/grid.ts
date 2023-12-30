import { Optional } from "./../types/optional";
import { Log } from "../utils/log";
import { Cell } from "./cell";
import { Vector } from "./vector";
import { Rectangle } from "./rectangle";
import { BOMB_PLACE_AVOIDANCE_RADIUS } from "../constants";

export class Grid {


	private cells: Cell[][];
	public flaggedCount = 0;
	public bombCount = 0;

	constructor(public columns: number, public rows: number) {
		this.generate();
	}

	isBomb(at: Vector): boolean {
		const cell = this.getCell(at);
		if (!cell) throw new Error("Invalid cell");

		return cell.isBomb;
	}

	toggleFlag(at: Vector) {
		const cell = this.getCell(at);
		if (!cell) throw new Error("Invalid cell");

		cell.isFlagged = !cell.isFlagged;

		if (cell.isFlagged) this.flaggedCount++;
		else this.flaggedCount--;
	}

	filterCells(predicate: (Cell) => boolean): Array<Cell> {
		const list: Array<Cell> = [];

		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.columns; col++) {
				const cell = this.getCell(col, row);
				if (!cell) throw new Error("Invalid cell");

				if (predicate(cell)) list.push(cell);
			}
		}

		return list;
	}

	/**
	 * Returns the cell at the specified position.
	 *
	 * @param position - The position of the cell as a Vector or the column index as a number.
	 * @param y - The row index of the cell (if `position` is a number).
	 * @return The cell at the specified position, or `null` if the position is out of bounds.
	 * @throws An error if the arguments are invalid.
	 */
	getCell(position: Vector | number, y: number | undefined = undefined): Optional<Cell> {
		// Convert arguments to column and row
		let col; let row = 0;
		if (typeof position === "number" && typeof y === "number") {
			col = position;
			row = y;
		} else if (position instanceof Vector && y === undefined) {
			col = position.x;
			row = position.y;
		} else {
			throw new Error("Invalid arguments");
		}

		// Check if the cell is out of bounds
		if (col < 0 || col >= this.columns || row < 0 || row >= this.rows) {
			return null;
		}

		return this.cells[row][col];
	}

	/**
	 * Generates a new grid with the specified number of rows and columns.
	 */
	generate() {
		this.cells = [];
		this.bombCount = 0;
		this.flaggedCount = 0;

		// Generate grid
		Log.info("Grid", `Generating grid ${this.columns}x${this.rows}...`);
		for (let row = 0; row < this.rows; row++) {
			this.cells[row] = [];
			for (let col = 0; col < this.columns; col++) {
				this.cells[row][col] = new Cell(col, row);
			}
		}
	}

	/**
	 * Places a given number of bombs randomly on the grid, avoiding a specified cell.
	 *
	 * @param avoiding The cell to avoid when placing bombs.
	 * @param bombs The number of bombs to place on the grid.
	 */
	placeBombs(avoiding: Vector, bombs: number) {
		// Place bombs
		Log.info("StatePlay", `Placing ${bombs} bombs avoiding ${avoiding} in a radius of ${BOMB_PLACE_AVOIDANCE_RADIUS}...`);
		for (let i = 0; i < bombs; i++) {
			const row = Math.floor(Math.random() * this.rows);
			const col = Math.floor(Math.random() * this.columns);
			const distanceFromPosition = Math.ceil(Math.distance(avoiding.x, avoiding.y, col, row));
			const cell = this.getCell(col, row);

			// Check for invalid positions
			if (!cell || cell.isBomb || distanceFromPosition < BOMB_PLACE_AVOIDANCE_RADIUS) {
				i--;
				continue;
			}

			cell.isBomb = true;
			this.bombCount++;
		}
	}

	/**
	 * Reveals the cell at the given position and clears its neighbors recursively if it has no bombs in surrounding cells.
	 *
	 * @param at - The position of the cell to reveal.
	 * @return True if the revealed cell is a bomb, false otherwise.
	 * @throws An error if the given position is invalid.
	 */
	clearCells(at: Vector) {
		// Log.debug("StatePlay", `Clearing cell at ${at}`);

		// Clear the cell
		const cell = this.getCell(at);
		if (!cell) throw new Error("Invalid cell");

		if (cell.isRevealed || cell.isFlagged) return;
		cell.isRevealed = true;

		// Check if the cell has any neighbors
		const neighbors = this.getNeighbors(at);
		const neighborBombs = neighbors.filter(n => n.isBomb).length;
		cell.neighbors = neighborBombs;

		// TODO: Check if the player won

		// Clear all neighbors if the cell has no neighbors
		if (neighborBombs === 0) {
			Log.debug("StatePlay", "No bombs in the neighborhood, clearing neighbors...");
			neighbors.forEach(n => this.clearCells(new Vector(n.x, n.y)));
		} else {
			Log.debug("StatePlay", `Found ${neighborBombs} bombs in the neighborhood`);
		}
	}

	/**
	 * Reveals all the bombs in the grid by setting the `isRevealed` property of each bomb cell to `true`.
	 *
	 * @throws {Error} If an invalid cell is found.
	 */
	revealBombs() {
		Log.info("StatePlay", "Revealing all bombs...");

		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.columns; col++) {
				const cell = this.getCell(col, row);
				if (!cell) throw new Error("Invalid cell");

				if (cell.isBomb) {
					cell.isRevealed = true;
				}
			}
		}
	}

	highlightCell(at: Vector) {
		const cell = this.getCell(at);
		if (!cell) throw new Error("Invalid cell");

		cell.isHighlighted = true;
	}

	/**
	 * Returns an array of neighboring cells for a given cell.
	 *
	 * @param at - The vector representing the cell to get neighbors for.
	 * @return An array of neighboring cells.
	 */
	getNeighbors(at: Vector): Array<Cell> {
		const neighbors: Array<Cell> = [];

		for (let y = -1; y <= 1; y++) {
			for (let x = -1; x <= 1; x++) {
				const cell = this.getCell(new Vector(at.x + x, at.y + y));
				if (!cell) continue;

				neighbors.push(cell);
			}
		}

		return neighbors;
	}

	render(ctx: CanvasRenderingContext2D, bounds: Rectangle) {
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.columns; col++) {
				const cell = this.getCell(col, row);
				if (!cell) throw new Error("Invalid cell");

				cell.render(ctx, new Rectangle(bounds.x + col * bounds.width, bounds.y + row * bounds.height, bounds.width, bounds.height));
			}
		}
	}

}