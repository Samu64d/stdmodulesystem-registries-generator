//
// BlockstatesProvider.ts
//

import * as config from "../config/config";
import FsUtils from "../utils/FsUtils";
import ConsoleManager, { ConsoleColors } from "../utils/ConsoleManager";

type IBlockstateProperty = string;

type IBlockstateValue = string;

type IBlockstatesData = Record<string, {
	definition: Object,
	properties: Record<IBlockstateProperty, Array<IBlockstateValue>>,
	states: Object
}>

export default class BlockstatesProvider {

	// Blockstate definitiones file name
	private static readonly BLOCKSTATES_FILE_NAME: string = "blocks.json";

	// Blockstate block properties list
	private blockPropertiesList: Map<string, Array<IBlockstateProperty>>

	// Blockstate property value list
	private propertyValuesList: Map<IBlockstateProperty, Array<string>>;

	constructor() {
		this.propertyValuesList = new Map<IBlockstateProperty, Array<string>>();
		this.blockPropertiesList = new Map<string, Array<IBlockstateProperty>>();
	}

	/**
	 * Load data
	 */
	public load(dataPath: string): void {
		let blockstatesFilePath: string = dataPath + "/reports/" + BlockstatesProvider.BLOCKSTATES_FILE_NAME;
		this.loadFromFile(blockstatesFilePath);
		ConsoleManager.log(this.propertyValuesList);
	}

	/**
	 * Iterate over all properties
	 */
	public forEachProperty(callback: Function): void {
		this.propertyValuesList.forEach((values: Array<string>, propertyName: string) => {
			callback(propertyName);
		});
	}

	/**
	 * Iterate over all block properties
	 */
	public forEachBlockProperty(callback: Function): void {
		this.blockPropertiesList.forEach((propertyList: Array<IBlockstateProperty>, value: string) => {
			callback(value, propertyList);
		});
	}

	/**
	 * Return a list of elements with a blockstate property
	 */
	public getPropertyValues(propertyName: IBlockstateProperty): Array<string> {
		let elements: Array<string> = new Array<string>();
		if (this.propertyValuesList.has(propertyName)) {
			elements.push(...<Array<string>>this.propertyValuesList.get(propertyName));
		}
		return elements;
	}

	/**
	 * Load data from a file
	 */
	private loadFromFile(filePath: string): void {
		let reports: IBlockstatesData = <IBlockstatesData>FsUtils.readJSONFile(filePath);
		for (let elementName in reports) {
			let properties: Record<string, string[]> = reports[elementName].properties;
			let propertyList: Array<string> = new Array<string>();
			for (let propertyName in properties) {
				propertyList.push(propertyName);
				let valueList: Array<string> = new Array<string>();
				if (this.propertyValuesList.has(propertyName)) {
					valueList = <Array<string>>this.propertyValuesList.get(propertyName);
				}
				let newValueList: Array<string> = properties[propertyName];
				for (let valueName of newValueList) {
					if (!valueList.includes(valueName)) {
						valueList.push(valueName);
					}
				}
				this.propertyValuesList.set(propertyName, valueList);
			}
			this.blockPropertiesList.set(elementName, propertyList);
		}
		if (config.DEBUG) ConsoleManager.log(filePath, ConsoleColors.GREEN);
	}

}
