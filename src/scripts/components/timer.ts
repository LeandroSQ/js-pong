export class Timer {

	private isRunning = false;
	public timer = 0;

	constructor() { }

	public get value() {
		return Math.floor(this.timer);
	}

	reset() {
		this.timer = 0;
		this.isRunning = false;
	}

	start() {
		this.isRunning = true;
	}

	stop() {
		this.isRunning = false;
	}

	update(deltaTime: number) {
		if (!this.isRunning) return;

		this.timer += deltaTime;
	}

}