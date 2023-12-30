export class Palette {

	private static readonly colors = [
		"#F97F51",
		"#1B9CFC",
		"#EAB543",
		"#FC427B",
		"#3B3B98",
		"#B33771",
		"#55E6C1",
		"#FD7272",
		"#F8EFBA",
		"#2C3A47"
	];

	private static index = 0;

	public static next(): string {
		const color = Palette.colors[Palette.index];
		Palette.index++;

		if (Palette.index >= Palette.colors.length) {
			Palette.index = 0;
		}

		return color;
	}

	public static previous(): void {
		if (Palette.index > 0) {
			Palette.index--;

			if (Palette.index < 0) {
				Palette.index = 0;
			}
		}
	}

}