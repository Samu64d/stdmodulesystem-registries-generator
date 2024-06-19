//
// MultiDatapackLoader.ts
//

import FsUtils from "../utils/FsUtils";
import DatapackLoader from "./DatapackLoader";
import DatapackManager from "./DatapackManager";

export default class MultiDatapackLoader {

	// Datapack
	private datapack: DatapackManager;

	// Datapacks root path
	private rootPathName: string;

	/**
	 * Load a datapack
	 */
	constructor(datapack: DatapackManager, rootPathName: string) {
		this.datapack = datapack;
		this.rootPathName = rootPathName;
	}

	/**
	 * Load the datapack data
	 */
	public load(): void {
		let datapacksFolders: string[] = FsUtils.getFolderElements(this.rootPathName);
		for (let datapackFolder of datapacksFolders) {
			let datapackPath: string = this.rootPathName + "/" + datapackFolder;
			let loader: DatapackLoader = new DatapackLoader(this.datapack, datapackPath);
			loader.load();
		}
	}
}
