export class Vector {

	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public dot(vector: Vector): number {
		return this.x * vector.x + this.y * vector.y;
	}

	public add(vector: Vector): Vector {
		return new Vector(this.x + vector.x, this.y + vector.y);
	}

	public subtract(vector: Vector): Vector {
		return new Vector(this.x - vector.x, this.y - vector.y);
	}

	public multiply(scalar: number): Vector {
		return new Vector(this.x * scalar, this.y * scalar);
	}

	public divide(divisor: number): Vector {
		return new Vector(this.x / divisor, this.y / divisor);
	}

	public normalize(): Vector {
		const length = this.length;

		return new Vector(this.x / length, this.y / length);
	}

	public clone(): Vector {
		return new Vector(this.x, this.y);
	}

	public get length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	public static get zero() {
		return new Vector(0, 0);
	}

	public toString(): string {
		return `{ ${this.x}, ${this.y} }`;
	}

}
