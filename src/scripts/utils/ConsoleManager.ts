//
// ConsoleManager.ts
//

import * as console from "console";

export enum ConsoleColors {
	RESET = "\x1b[0m",
	WHITE = "\x1b[37m",
	RED = "\x1b[31m",
	GREEN = "\x1b[32m",
	YELLOW = "\x1b[33m",
	CYAN = "\x1b[36m"
}

export default class ConsoleManager {

	constructor() {
	}

	/**
	 * Log text on console
	 */
	public static log(data: any, color: string = ConsoleColors.WHITE): void {
		if (data instanceof Object && color === ConsoleColors.WHITE) {
			console.log(data);
		} else {
			console.log(color + "%s" + ConsoleColors.RESET, data);
		}
	}

}
