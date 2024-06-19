//
// DatapackGenerator.ts
//

import * as config from "../config/config";
import FsUtils from "../utils/FsUtils";
import ConsoleManager, { ConsoleColors } from "../utils/ConsoleManager";
import { ResourceTypes, TagTypes } from "./commons";
import DatapackResourceLocation from "./DatapackResourceLocation";
import DatapackManager from "./DatapackManager";

export default class DatapackGenerator {

	// Datapack
	private datapack: DatapackManager;

	// Datapack root path
	private rootPathName: string;

	/**
	 * Generate a datapack
	 */
	constructor(datapack: DatapackManager, rootPathName: string) {
		this.datapack = datapack;
		this.rootPathName = rootPathName;
	}

	/**
	 * Generate the datapack data
	 */
	public generate(): void {

		// Functions
		this.generateFunctions();

		// Tags
		this.generateTagGroups();
	}

	/**
	 * Generate all functions
	 */
	private generateFunctions(): void {
		this.datapack.forEachFunction((functionName: string) => {
			this.generateFunction(functionName);
		})
	}

	/**
	* Generate a function
	*/
	private generateFunction(functionName: string): void {

		// Create text data
		let functionTextHead: string = "#\n# " + functionName + "\n#\n\n# These commands are auto generated. Do not modify\n";
		let functionText: string = functionTextHead + this.datapack.getFunctionContents(functionName);

		// Creat path
		let functionPath: string = DatapackResourceLocation.fromResourceURI(functionName, ResourceTypes.FUNCTIONS).getResourcePath();
		functionPath = FsUtils.joinPath(this.rootPathName, functionPath);

		// Write on file
		FsUtils.writeTextFile(functionPath, functionText);
		if (config.DEBUG) ConsoleManager.log(functionPath, ConsoleColors.GREEN);
	}

	/**
	* Generate all tag groups
	*/
	public generateTagGroups(): void {
		this.datapack.forEachTagGroup((tagType: TagTypes) => {
			this.generateTagGroup(tagType);
		});
	}

	/** 
	 * Generate a tag group
	 */
	public generateTagGroup(tagType: TagTypes): void {
		this.datapack.forEachTag(tagType, (tagName: string) => {
			this.generateTag(tagType, tagName);
		});
	}

	/**
	* Generate a tag
	*/
	public generateTag(tagType: TagTypes, tagName: string): void {

		// Create json object
		let tagObject: object = {
			replace: false,
			values: this.datapack.getTagElements(tagType, tagName)
		};

		// Create path
		let tagPath: string = DatapackResourceLocation.fromResourceURI(tagName, ResourceTypes.TAGS, tagType).getResourcePath();
		tagPath = FsUtils.joinPath(this.rootPathName, tagPath);

		// Write on file
		FsUtils.writeJSONFile(tagPath, tagObject);
		if (config.DEBUG) ConsoleManager.log(tagPath, ConsoleColors.GREEN);
	}

}
