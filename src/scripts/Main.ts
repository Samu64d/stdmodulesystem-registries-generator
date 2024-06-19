//
// Main.ts
//
// STD Module System registries generator
// Version 1.0.0 (Protocol version 1.0.0)

import * as config from "./config/config";
import * as constants from "./config/const";
import MathUtils from "./utils/MathUtils";
import ConsoleManager, { ConsoleColors } from "./utils/ConsoleManager";
import ReportsProvider from "./reports/ReportsProvider";
import { TagTypes } from "./datapack/commons";
import DatapackManager from "./datapack/DatapackManager";
import { RegistryPropValue } from "./registries/commons";
import { PropType } from "./registries/propType";
import RegistryProvider from "./registries/RegistryProvider";
import RegistryConfigurationProvider from "./registries/RegistryConfigurationProvider";
import BlockstatesProvider from "./reports/BlockstatesProvider";

export class Main {

	private reports: ReportsProvider;
	private inDatapack: DatapackManager;
	private registries: RegistryProvider;
	private outDatapack: DatapackManager;

	constructor() {
		this.reports = new ReportsProvider();
		this.inDatapack = new DatapackManager();
		this.registries = new RegistryProvider(this.reports, this.inDatapack);
		this.outDatapack = new DatapackManager();
	}

	/**
	 * Main
	 */
	public static main(): void {
		let main: Main = new Main();
		main.run();
	}

	/**
	 * Run
	 */
	public run(): void {
		ConsoleManager.log("\nSTD Module System registry generator\nVersion: 1.0.0 (Protocol version 1.0.0)\n", ConsoleColors.YELLOW);

		// Load reports
		ConsoleManager.log("Loading provided Minecraft reports");
		this.reports.load(config.IN_REPORTS_PATH);

		// Load datapacks
		ConsoleManager.log("Loading provided datapacks");
		this.inDatapack.multiload(config.IN_DATAPACKS_PATH);

		// Load registries
		ConsoleManager.log("Loading registries configuration and registries data");
		this.registries.load(config.IN_REGISTRIES_PATH, config.IN_SCHEMAS_PATH);
		ConsoleManager.log("Registries protocol version number: " + constants.PROTOCOL_VERSION);
		ConsoleManager.log("Registries data version number: " + this.registries.getConfig().getDataVersion());

		// Generate datapack
		ConsoleManager.log("Starting registries generation process");
		this.generateTags();
		this.generateFunctions();

		// Save datapack
		ConsoleManager.log("Attempting to saving data on out folder");
		this.outDatapack.save(config.OUT_DATAPACK_PATH);

		// End
		ConsoleManager.log("Process successfully completed! Registries saved in " + config.OUT_DATAPACK_PATH);
		return;
	}

	/**
	 * Generate functions
	 */
	public generateFunctions(): void {

		// Generate payload function
		let functionName: string = config.OUT_DATAPACK_NAMESPACE + ":cache/set_static";
		let functionContents: string = "";
		functionContents = "data modify storage minecraft_registries:static PROTOCOL_VERSION set value " + constants.PROTOCOL_VERSION + "\n";
		functionContents += "data modify storage minecraft_registries:static DATA_VERSION set value " + this.registries.getConfig().getDataVersion() + "\n";
		this.registries.forEach((registryName: string) => {

			// Name
			let stringObject: string = "{";
			let init: boolean = true;
			this.registries.forEachElement(registryName, (elementName: string) => {
				let registryElement = this.registries.getElement(registryName, elementName);
				let elementId: number = MathUtils.parseNumeric(registryElement["id"]);
				stringObject += (init ? "" : ", ") + elementId + ":\"" + elementName + "\"";
				init = false;
			});
			stringObject += "}";
			functionContents += "data modify storage minecraft_registries:static DATA." + registryName.toUpperCase() + "_NAME set value " + stringObject + "\n";

			// Props
			let registriesConfig: RegistryConfigurationProvider = this.registries.getConfig();
			registriesConfig.forEachProp(registryName, (propName: string) => {
				if (propName == "id") return;
				let propType: PropType = this.registries.getConfig().getPropType(registryName, propName);
				let stringObject: string = "{";
				let init: boolean = true;
				this.registries.forEachElement(registryName, (elementName: string) => {
					let registryElement = this.registries.getElement(registryName, elementName);
					let propValue: RegistryPropValue = registryElement[propName];
					let parsedPropValue: string = "";
					if (propType == "real") {
						parsedPropValue = (MathUtils.isInteger(propValue) ? (<number>propValue).toFixed(1) : propValue) + "d";
					} else {
						parsedPropValue = propValue.toString();
					}
					stringObject += (init ? "" : ", ") + "\"" + elementName + "\":" + parsedPropValue;
					init = false;
				});
				stringObject += "}";
				functionContents += "data modify storage minecraft_registries:static DATA." + registryName.toUpperCase() + "_" + propName.toUpperCase() + " set value " + stringObject + "\n";
			});

			ConsoleManager.log("Generated function variables for registry \"" + registryName + "\"");
		});

		// Blockstates
		let stringObject = "{";
		let init = true;
		let blockstates: BlockstatesProvider = this.reports.getBlockstates();
		blockstates.forEachBlockProperty((value: string, propertyList: Array<string>) => {
			stringObject += (init ? "" : ", ") + "\"" + value + "\":[";
			let init2 = true;
			for (let property of propertyList) {
				stringObject += (init2 ? "" : ", ") + "\"" + property + "\"";
				init2 = false;
			}
			stringObject += "]";
			init = false;
		});
		stringObject += "}";
		functionContents += "data modify storage minecraft_registries:static DATA.BLOCKSTATES set value " + stringObject + "\n";
		this.outDatapack.createFunction(functionName, functionContents);

		// Blocktstates getter functions
		blockstates.forEachProperty((propertyName: string) => {
			// Get property value list
			let valueList: Array<string> = blockstates.getPropertyValues(propertyName);
			let functionContents: string = "";
			for (let value of valueList) {
				functionContents += "execute if block ~ ~ ~ #minecraft_registries:all[" + propertyName + "=" + value + "] run data modify storage io: property set value \"" + value + "\"\n";
			}
			let functionName: string = config.OUT_DATAPACK_NAMESPACE + ":providers/blockstates/get_" + propertyName;
			this.outDatapack.createFunction(functionName, functionContents);
		});
		ConsoleManager.log("Generated blockstate functions");

	}

	/**
	 * Generate tags
	 */
	public generateTags(): void {

		this.registries.forEach((registryName: string) => {
			this.registries.getConfig().forEachProp(registryName, (propName: string) => {
				if (propName != "id") return;
				let tagValues: Array<Array<string>> = new Array();
				let propSize: number = this.registries.getConfig().getPropSize(registryName, propName);
				let propSign: boolean = this.registries.getConfig().getPropSign(registryName, propName);
				for (let bit = 0; bit < propSize; bit++) tagValues.push(new Array());

				// Check bits for each element 
				this.registries.forEachElement(registryName, (elementName: string) => {
					let registryElement = this.registries.getElement(registryName, elementName);
					let propValue: RegistryPropValue = RegistryConfigurationProvider.denormalizePropValue(registryElement[propName], propSize, propSign);
					for (let bit = 0; bit < propSize; bit++) {
						if (MathUtils.getBit(propValue, bit)) {
							tagValues[bit].push(elementName);
						}
					}
				});

				// Save tags
				let elementTagType: TagTypes = this.registries.getConfig().getElementTagType(registryName);
				for (let bit = 0; bit < propSize; bit++) {
					let tagName: string = config.OUT_DATAPACK_NAMESPACE + ":" + "/property/" + propName + "/bit_" + (bit + 1);
					this.outDatapack.createTag(elementTagType, tagName, tagValues[bit]);
				}
			});
			ConsoleManager.log("Generated tags for registry \"" + registryName + "\"");
		});

	}

}

Main.main();
