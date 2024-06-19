//
// ReportsProvider.ts
//

import RegistryProvider from "./RegistryProvider";
import BlockstatesProvider from "./BlockstatesProvider";

export default class ReportsProvider {

	// Registries
	private registries: RegistryProvider;

	// Blockstates
	private blockstates: BlockstatesProvider;

	constructor() {
		this.registries = new RegistryProvider();
		this.blockstates = new BlockstatesProvider();
	}

	/**
	 * Load data
	 */
	public load(dataPath: string) {
		this.registries.load(dataPath);
		this.blockstates.load(dataPath);
	}

	/**
	 * Get the registries provider
	 */
	public getRegistries(): RegistryProvider {
		return this.registries;
	}

	/**
	 * Get blockstates provider
	 */
	public getBlockstates(): BlockstatesProvider {
		return this.blockstates;
	}

}
