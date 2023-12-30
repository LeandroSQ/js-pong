export interface IState {

	setup(): Promise<void>;

	update(deltaTime: number): Promise<void>;

	resize();

	render(ctx: CanvasRenderingContext2D);

}