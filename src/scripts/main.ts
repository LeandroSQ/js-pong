import "./extensions";
import { Log } from "./utils/log";
import { Theme } from "./utils/theme";
import { DensityCanvas } from "./components/density-canvas";
import { InputHandler } from "./components/input-handler";
import { IState } from "./states/state";
import { StatePlay } from "./states/state-play";
import { Gizmo } from "./utils/gizmo";
import { StateAgentPlay } from "./states/state-agent-play";

export class Main {

	// Graphics
	public canvas = new DensityCanvas("canvas");
	public ctx = this.canvas.context;

	// Frame
	private handleAnimationFrameRequest = -1;
	private lastFrameTime = performance.now();

	// Misc
	public state: IState = new StatePlay(this);
	public globalTimer = 0;

	constructor() {
		Log.info("Main", "Starting up...");
		this.attachHooks();

		// Setup theme controller
		Theme.setup(this);
	}

	private attachHooks() {
		Log.info("Main", "Attaching hooks...");

		window.addLoadEventListener(this.onLoad.bind(this));
		window.addVisibilityChangeEventListener(this.onVisibilityChange.bind(this));
		window.addEventListener("resize", this.onResize.bind(this));

		InputHandler.setup(this);
	}

	// #region Event listeners
	private async onLoad() {
		Log.debug("Main", "Window loaded");

		// Attach the canvas element to DOM
		this.canvas.attachToElement(document.body);

		// Setup canvas
		this.onResize();

		// Setup game state
		await this.state.setup();

		// Request the first frame
		this.requestNextFrame();
	}

	private onVisibilityChange(isVisible: boolean) {
		Log.info("Main", `Window visibility changed to ${isVisible ? "visible" : "hidden"}`);

		if (isVisible) {
			// Request the next frame
			this.requestNextFrame();
		} else {
			// Cancel the next frame
			if (this.handleAnimationFrameRequest != -1) {
				cancelAnimationFrame(this.handleAnimationFrameRequest);
			}
		}
	}

	private onResize() {
		Log.debug("Main", "Window resized");

		// Resize canvas
		this.canvas.setSize(window.innerWidth, window.innerHeight);

		// Setup game state
		this.state.resize();
	}
	// #endregion

	// #region Frame
	private requestNextFrame() {
		this.handleAnimationFrameRequest = requestAnimationFrame(this.loop.bind(this));
	}

	private async loop(time: DOMHighResTimeStamp) {
		const deltaTime = (time - this.lastFrameTime) / 1000.0;
		this.lastFrameTime = time;

		await this.state.update(deltaTime);
		InputHandler.update();

		this.state.render(this.ctx);
		Gizmo.render(this.ctx);
		// Gizmo.clear();


		this.requestNextFrame();
	}
	// #endregion

}

// Start the game
window._instance = new Main();
