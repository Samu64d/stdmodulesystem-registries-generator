//
// DatapackLoader.ts
//

import * as config from "../config/config";
import FsUtils from "../utils/FsUtils";
import ConsoleManager, { ConsoleColors } from "../utils/ConsoleManager";
import { ResourceTypes, TagTypes, ResourceTypeToFolderName, TagTypeToFolderName } from "./commons";
import DatapackResourceLocation from "./DatapackResourceLocation";
import DatapackManager from "./DatapackManager";

export default class DatapackLoader {

	// Datapack
	private datapack: DatapackManager;

	// Datapack root path
	private rootPathName: string;

	// Datapack namespace folder
	private namespacesPathName: string;

	/**
	 * Load a datapack
	 */
	constructor(datapack: DatapackManager, rootPathName: string) {
		this.datapack = datapack;
		this.rootPathName = rootPathName;
		this.namespacesPathName = rootPathName + "/data";
	}

	/**
	 * Load the datapack data
	 */
	public load(): void {
		let namespaceNames: Array<string> = FsUtils.getFolderElements(this.namespacesPathName);
		for (let namespaceName of namespaceNames) {
			let dataPath: string = this.namespacesPathName + "/" + namespaceName;
			this.loadDataFromNamespaceFolder(dataPath);
		}
	}

	/**
	 * Load data from a namespace folder
	 */
	private loadDataFromNamespaceFolder(dataPath: string): void {

		// Functions
		let functionsPath: string = dataPath + "/" + ResourceTypeToFolderName.get(ResourceTypes.FUNCTIONS);
		this.loadFunctionsFromFolder(functionsPath);

		// Tag groups
		let tagGroupsPath: string = dataPath + "/" + ResourceTypeToFolderName.get(ResourceTypes.TAGS);
		this.loadTagGroupsFromFolder(tagGroupsPath);
	}

	/**
	 * Load all functions from a folder
	 */
	private loadFunctionsFromFolder(functionsPath: string): void {
		if (FsUtils.folderExists(functionsPath)) {
			FsUtils.scanFolder(functionsPath, this.loadFunction.bind(this));
		}
	}

	/**
	 * Load a function
	 */
	private loadFunction(functionPath: string): void {
		let functionText: any = FsUtils.readTextFile(functionPath);
		let functionUri = DatapackResourceLocation.fromResourcePath(functionPath, this.namespacesPathName);
		this.datapack.createFunction(functionUri.getResourceURI(), functionText);
		if (config.DEBUG) ConsoleManager.log(functionPath, ConsoleColors.GREEN);
		return;
	}

	/**
	 * Load all tag groups from a folder
	 */
	private loadTagGroupsFromFolder(tagGroupsPath: string): void {
		for (let tagTypeId in TagTypes) {
			let tagTypeFolder: string = <string>TagTypeToFolderName.get(TagTypes[tagTypeId as keyof typeof TagTypes]);
			let tagGroupPath: string = tagGroupsPath + "/" + tagTypeFolder;
			if (FsUtils.folderExists(tagGroupPath)) {
				this.loadTagGroupFromFolder(tagGroupPath);
			}
		}
	}

	/**
	 * Load a tag group from a folder
	 */
	private loadTagGroupFromFolder(tagGroupPath: string): void {
		FsUtils.scanFolder(tagGroupPath, this.loadTagFromFile.bind(this));
	}

	/**
	 * Load a tag from a file
	 */
	private loadTagFromFile(tagPath: string): void {
		let tagObject: any = FsUtils.readJSONFile(tagPath);
		let tagUri = DatapackResourceLocation.fromResourcePath(tagPath, this.namespacesPathName);
		this.datapack.updateTag(<TagTypes>tagUri.getTagType(), tagUri.getResourceURI(), tagObject.values, tagObject.replace);
		if (config.DEBUG) ConsoleManager.log(tagPath, ConsoleColors.GREEN);
	}

}
