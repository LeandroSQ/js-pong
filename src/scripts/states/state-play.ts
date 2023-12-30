import { SevenSegmentsDisplay } from "./../components/seven-segment-display";
import { BORDER, COLOR_BASE, COLOR_SHADOW, DISPLAY_MARGIN, UI_SCALING } from "./../constants";
import { IState } from "./state";
import { Main } from "../main";
import { Size } from "../types/size";
import { Vector } from "../models/vector";
import { DEFAULT_CELL_SIZE, DIFFICULTIES, HEADER_HEIGHT, PADDING } from "../constants";
import { Difficulty } from "../types/difficulty";
import { Rectangle } from "../models/rectangle";
import { Cell } from "../models/cell";
import { renderOutsidePanel, renderInnerPanel } from "../utils/panel";
import { InputHandler, MouseButton } from "../components/input-handler";
import { Log } from "../utils/log";
import { Grid } from "../models/grid";
import { Timer } from "../components/timer";
import { ButtonFace, FaceButton } from "../models/face-button";

export class StatePlay implements IState {

	private screen: Size = { width: 0, height: 0 };
	protected cellSize = DEFAULT_CELL_SIZE;
	protected difficulty: Difficulty = DIFFICULTIES.EASY;

	private bombCounterDisplay: SevenSegmentsDisplay;

	private timerDisplay: SevenSegmentsDisplay;
	private timer: Timer = new Timer();

	private isRunning = true;
	private isDirty = false;

	private previewCell: Cell | null = null;

	protected grid: Grid;

	protected boardBounds: Rectangle;
	protected headerBounds: Rectangle;

	private faceButton: FaceButton = new FaceButton();

	private get position() {
		return new Vector(
			this.main.canvas.width / 2 - this.screen.width / 2,
			this.main.canvas.height / 2 - this.screen.height / 2
		);
	}

	private get bounds() {
		return new Rectangle(this.position.x, this.position.y, this.screen.width, this.screen.height);
	}

	constructor(private main: Main) {
		this.bombCounterDisplay = new SevenSegmentsDisplay(this.difficulty.bombs);
		this.timerDisplay = new SevenSegmentsDisplay(0);
		this.faceButton.addOnButtonPressedListener(this.onFaceButtonPressed.bind(this));
	}

	public async setup() {
		this.grid = new Grid(this.difficulty.columns, this.difficulty.rows);

		await this.faceButton.setup();
		await this.bombCounterDisplay.setup();
		await this.timerDisplay.setup();
		await Cell.setup();

		this.invalidate();
	}

	protected start(position: Vector) {
		Log.info("StatePlay", "Starting game!");

		this.isRunning = true;
		this.timer.start();
		this.grid.placeBombs(position, this.difficulty.bombs);
		this.grid.clearCells(position);
		this.invalidate();
	}

	protected reset() {
		// Reset game state
		this.isRunning = true;
		this.invalidate();

		// Reset timers
		this.timer.reset();
		this.bombCounterDisplay.value = this.difficulty.bombs;
		this.timerDisplay.value = 0;
	}

	resize() {
		// WIDTH = X * COLUMNS + PADDING * 2 + BORDER * 2
		// X = (WIDTH - PADDING * 2 - BORDER * 2) / COLUMNS
		// HEIGHT = Y * ROWS + PADDING * 3 + HEADER_HEIGHT + BORDER * 2
		// Y = (HEIGHT - PADDING * 3 - HEADER_HEIGHT - BORDER * 2) / ROWS
		this.cellSize = Math.min(
			DEFAULT_CELL_SIZE,
			(this.main.canvas.width - PADDING * 4 - BORDER * 2) / this.difficulty.columns,
			(this.main.canvas.height - PADDING * 6 - HEADER_HEIGHT - BORDER * 2) / this.difficulty.rows
		);
		this.screen.width = this.cellSize * this.difficulty.columns + PADDING * 2 + BORDER * 2;
		this.screen.height = this.cellSize * this.difficulty.rows + PADDING * 3 + HEADER_HEIGHT + BORDER * 2;

		// Calculate the header size
		this.headerBounds = new Rectangle(
			this.position.x + PADDING,
			this.position.y + PADDING,
			this.screen.width - PADDING * 2,
			HEADER_HEIGHT
		);

		// Calculate the board size
		this.boardBounds = new Rectangle(
			this.position.x + PADDING,
			this.position.y + PADDING + this.headerBounds.height + PADDING,
			this.screen.width - PADDING * 2,
			this.screen.height - PADDING * 3 - this.headerBounds.height
		);

		// Calculate the displays size
		let displaySize = { width: this.cellSize * 2, height: this.headerBounds.height - BORDER * 2 - DISPLAY_MARGIN * 2 };
		const displayAspectRatio = 1 / 3;
		if (displaySize.width / displaySize.height < displayAspectRatio) {
			displaySize.width = displaySize.height * displayAspectRatio;
		} else {
			displaySize.height = displaySize.width / displayAspectRatio;
		}
		displaySize = {
			width: Math.clamp(displaySize.width, 0, this.screen.width),
			height: Math.clamp(displaySize.height, 0, this.headerBounds.height - BORDER * 2 - DISPLAY_MARGIN * 2)
		};
		const displayY = this.headerBounds.y + BORDER + DISPLAY_MARGIN;
		this.bombCounterDisplay.resize(new Rectangle(
			this.headerBounds.x + BORDER + DISPLAY_MARGIN,
			displayY,
			displaySize.width,
			displaySize.height
		), this.main.canvas.context);
		this.timerDisplay.resize(new Rectangle(
			this.headerBounds.x + this.headerBounds.width - BORDER - displaySize.width - DISPLAY_MARGIN,
			displayY,
			displaySize.width,
			displaySize.height
		), this.main.canvas.context);

		// Calculate the restart button bounds
		const buttonSize = Math.min(this.headerBounds.height - BORDER * 2 - DISPLAY_MARGIN * 2, this.screen.width / 3);
		this.faceButton.resize(new Rectangle(
			this.headerBounds.x + this.headerBounds.width / 2 - buttonSize / 2,
			this.headerBounds.y + this.headerBounds.height / 2 - buttonSize / 2,
			buttonSize,
			buttonSize
		));

		/* Gizmo.outline(this.bounds, "red");
		Gizmo.outline(this.headerBounds, "magenta");
		Gizmo.outline(this.boardBounds, "purple");
		Gizmo.outline(new Rectangle(this.boardBounds.x + BORDER, this.boardBounds.y + BORDER, this.cellSize, this.cellSize), "blue"); */

		this.invalidate();
	}

	/**
	 * @return The mouse coordinates relative to the grid, or null if the mouse is outside the grid
	 */
	private getMouseCoordinates(): Vector | null {
		const mouse = InputHandler.mouse;
		const localizedMousePosition = new Vector(
			Math.clamp(Math.floor((mouse.x - this.boardBounds.x) / this.cellSize), 0, this.difficulty.columns - 1),
			Math.clamp(Math.floor((mouse.y - this.boardBounds.y) / this.cellSize), 0, this.difficulty.rows - 1),
		);

		if (this.boardBounds.contains(mouse)) {
			/* Gizmo.rect(new Rectangle(
				this.boardBounds.x + BORDER + CELL_BORDER + localizedMousePosition.x * this.cellSize,
				this.boardBounds.y + BORDER + CELL_BORDER + localizedMousePosition.y * this.cellSize,
				this.cellSize - CELL_BORDER * 2,
				this.cellSize - CELL_BORDER * 2
			), "RED"); */

			return localizedMousePosition;
		}

		return null;
	}

	public async update(deltaTime: number) {
		await this.handleInput(deltaTime);

		if (!this.isRunning) return;

		/* Update timer */
		this.timer.update(deltaTime);
		this.timerDisplay.value = this.timer.value;
		this.bombCounterDisplay.value = this.difficulty.bombs - this.grid.flaggedCount;
	}

	protected async handleInput(deltaTime: number) {
		const mouse = this.getMouseCoordinates();

		if (this.isRunning && mouse) {
			this.updatePreviewCell(mouse);

			if (InputHandler.isMouseButtonJustReleased(MouseButton.Left)) {
				this.previewCell = null;

				if (this.grid.bombCount <= 0) {
					this.start(mouse);
				} else if (this.grid.isBomb(mouse)) {
					this.onGameOver(mouse);
				} else {
					this.grid.clearCells(mouse);
				}

				this.invalidate();
			} else if (InputHandler.isMouseButtonJustPressed(MouseButton.Right)) {
				this.onFlagCell(mouse);
			}
		}

		this.faceButton.update(deltaTime);
	}

	private onFlagCell(mouse: Vector) {
		this.grid.toggleFlag(mouse);

		if (this.grid.flaggedCount === this.grid.bombCount && this.grid.filterCells(x => x.isBomb && x.isFlagged).length === this.grid.bombCount) {
			this.onGameWin();
		}

		this.invalidate();
	}

	private updatePreviewCell(mouse: Vector) {
		if (InputHandler.isMouseButtonDown(MouseButton.Left)) {
			const cell = this.grid.getCell(mouse);
			if (cell && !cell.isRevealed) {
				this.previewCell = new Cell(cell.x, cell.y);
				this.previewCell.isRevealed = true;
				this.faceButton.face = ButtonFace.Surprised;
				this.invalidate();
			} else {
				this.previewCell = null;
				this.invalidate();
			}
		} else {
			this.faceButton.face = ButtonFace.Happy;
		}
	}

	private onGameOver(mouse: Vector) {
		Log.info("StatePlay", "Game over!");
		this.isRunning = false;
		this.grid.revealBombs();
		this.grid.highlightCell(mouse);
		this.timer.stop();

		this.faceButton.face = ButtonFace.Dead;
	}

	private onGameWin() {
		Log.info("StatePlay", "You won!");
		this.isRunning = false;
		this.grid.revealBombs();
		this.timer.stop();
		this.bombCounterDisplay.value = 0;

		this.faceButton.face = ButtonFace.Cool;
	}

	public render(ctx: CanvasRenderingContext2D) {
		if (this.isDirty) {
			this.isDirty = false;

			this.main.canvas.clear();

			// Outer panel
			renderOutsidePanel(ctx, this.bounds, BORDER);

			// Inside header panel
			renderInnerPanel(ctx, this.headerBounds, BORDER);

			// Inside grid panel
			renderInnerPanel(ctx, this.boardBounds, BORDER);
			this.renderGrid(ctx);
		}

		// Restart button
		this.faceButton.render(ctx);

		// Displays
		this.bombCounterDisplay.render(ctx);
		this.timerDisplay.render(ctx);
	}

	private renderGrid(ctx: CanvasRenderingContext2D) {
		const bounds = new Rectangle(
			this.boardBounds.x + BORDER,
			this.boardBounds.y + BORDER,
			this.cellSize,
			this.cellSize
		);

		this.grid.render(ctx, bounds);

		// Render preview cell
		if (this.previewCell !== null) {
			ctx.fillStyle = COLOR_BASE;
			ctx.strokeStyle = COLOR_SHADOW;
			ctx.lineWidth = 1 * UI_SCALING;
			ctx.beginPath();
			ctx.rect(bounds.x + this.previewCell.x * bounds.width, bounds.y + this.previewCell.y * bounds.height, bounds.width, bounds.height);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}

	protected invalidate() {
		this.isDirty = true;
		this.timerDisplay.invalidate();
		this.bombCounterDisplay.invalidate();
		this.faceButton.invalidate();
	}

	private onFaceButtonPressed() {
		this.faceButton.face = ButtonFace.Happy;
		this.grid.generate();
		this.reset();
	}

}