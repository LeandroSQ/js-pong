import { Main } from "./../main";
import { Log } from "./log";
import { Color } from "./color";

export class Theme {

	public static background: string;

	public static foreground: string;

	public static containerBackground: string;

	public static containerBorder: string;

	public static containerShadow: string;

	public static cellAlive: string;

	public static cellDead: string;

	private static main: Main;

	public static async setup(main: Main) {
		Theme.main = main;

		Theme.loadVariables();
		Theme.observeChanges();
	}

	private static loadVariables() {
		// Define the CSS variables to keep track of
		const variables = [
			"--background",
			"--foreground",
			"--container-background",
			"--container-border",
			"--container-shadow",
			"--cell-alive",
			"--cell-dead",
		];

		Log.info("Theme", `Setting up theme, loading ${variables.length} variables...`);

		console.groupCollapsed("Loading theme variables");

		// Iterate trough variables
		const style = getComputedStyle(document.body);
		for (const variable of variables) {
			// Get the variable value
			const value = style.getPropertyValue(variable);
			const name = variable.toString().toCamelCase();

			// Set the variable on this instance
			Theme[name] = value;

			// Print out the variable
			console.log(`%c${name}`, `color: ${Color.isColorLight(value) ? "#212121" : "#eee"}; background-color: ${value}`);

		}

		console.groupEnd();
	}

	private static observeChanges() {
		const darkThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		darkThemeMediaQuery.addEventListener("change", () => {
			Log.info("Theme", `Changed theme to ${darkThemeMediaQuery.matches ? "dark" : "light"}`);

			Theme.loadVariables();
		});
	}

}