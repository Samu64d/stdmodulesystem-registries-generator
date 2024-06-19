//
// RegistryProvider.ts
//

import * as config from "../config/config";
import FsUtils from "../utils/FsUtils";
import ObjectUtils from "../utils/ObjectUtils";
import ConsoleManager, { ConsoleColors } from "../utils/ConsoleManager";
import ReportsProvider from "../reports/ReportsProvider";
import DatapackManager from "../datapack/DatapackManager";
import { IRegistry, IRegistryData, RegistrySelectorElement, RegistrySelector, RegistryElement } from "./commons";
import RegistryConfigurationProvider from "./RegistryConfigurationProvider";
import RegistrySelectorParser from "./RegistrySelectorParser";
import RegistrySelectorElementParser from "./RegistrySelectorElementParser";

export default class RegistryProvider {

	// Registry file extension
	private static readonly REGISTRIES_FILE_EXT: string = "json";

	// Registry default element name
	private static readonly DEFAULT_SELECTOR: RegistrySelector = "default";

	// Reports
	private reports: ReportsProvider;

	// Datapack
	private datapack: DatapackManager;

	// Registry configuration provider
	private config: RegistryConfigurationProvider;

	// Registry list
	private registryList: Map<string, IRegistry>;

	constructor(reports: ReportsProvider, datapack: DatapackManager) {
		this.reports = reports;
		this.datapack = datapack;
		this.config = new RegistryConfigurationProvider(this);
		this.registryList = new Map<string, IRegistry>();
	}

	/**
	 * Load registries
	 */
	public load(dataPath: string, configDataPath: string): void {

		// Load configuration
		this.config.load(configDataPath);

		// Load data
		this.loadFromFolder(dataPath);
	}

	/**
	 * Get config
	 */
	public getConfig(): RegistryConfigurationProvider {
		return this.config;
	}

	/**
	 * Get datapack
	 */
	public getDatapack(): DatapackManager {
		return this.datapack;
	}

	/**
	 * Get reports
	 */
	public getReports(): ReportsProvider {
		return this.reports;
	}

	/**
	 * Iterate over all registries
	 */
	public forEach(callback: Function): void {
		let registries: Map<string, IRegistry> = this.registryList;
		registries.forEach((registry: IRegistry, registryName: string) => {
			callback(registryName);
		});
	}

	/**
	 * Iterate over all elements of a registry
	 */
	public forEachElement(registryName: string, callback: Function): void {
		let elements: Map<string, RegistryElement> = this.getElements(registryName);
		elements.forEach((element: RegistryElement, elementName: string) => {
			callback(elementName);
		})
	}

	/**
	 * Get an element from a registry
	 */
	public getElement(registryName: string, elementName: string): RegistryElement {
		if (this.existsElement(registryName, elementName)) {
			let elements: Map<string, RegistryElement> = this.getElements(registryName);
			return <RegistryElement>elements.get(elementName);
		} else throw new Error("Element \"" + elementName + "\" was not found in registry \"" + registryName + "\"");
	}

	/**
	 * Check if a registry contains an element
	 */
	public existsElement(registryName: string, elementName: string): boolean {
		let elements: Map<string, RegistryElement> = this.getElements(registryName);
		return elements.has(elementName);
	}

	/**
	 * Load registries from a folder
	 */
	private loadFromFolder(folderPath: string): void {
		let registriesFolders: string[] = FsUtils.getFolderElements(folderPath);

		// Load registries from each subfolder
		this.config.forEach((registryName: string) => {
			let entries: Map<string, RegistryElement> = new Map<string, RegistryElement>();

			for (let registryNamespace of registriesFolders) {
				let filePath: string = folderPath + "/" + registryNamespace + "/" + registryName + "." + RegistryProvider.REGISTRIES_FILE_EXT;
				let registryData: IRegistryData = <IRegistryData>FsUtils.readJSONFile(filePath);
				let defaultElement: RegistrySelectorElement = registryData.entries[RegistryProvider.DEFAULT_SELECTOR] || {};

				// Parse each selector and selector element
				for (let selector in registryData.entries) {
					if (selector === RegistryProvider.DEFAULT_SELECTOR) continue;

					let element: RegistrySelectorElement = registryData.entries[selector];
					let elementNames: Array<string> = new RegistrySelectorParser(this, registryName, registryNamespace).parse(selector);
					for (let elementName of elementNames) {
						let baseElement: RegistrySelectorElement = entries.has(elementName) ? <RegistryElement>entries.get(elementName) : defaultElement;
						let unparsedElement: RegistrySelectorElement = <RegistrySelectorElement>ObjectUtils.merge(baseElement, element);
						let finalElement: RegistryElement = new RegistrySelectorElementParser(this, registryName).parse(unparsedElement, elementName, selector);
						entries.set(elementName, finalElement);
					}
				}

				// Add other reports elements
				this.config.forEachElement(registryName, (elementName: string) => {
					if ((!elementName.startsWith(registryNamespace) && elementName != "unknow") || entries.has(elementName)) return;
					let finalElement: RegistryElement = new RegistrySelectorElementParser(this, registryName).parse(defaultElement, elementName);
					entries.set(elementName, finalElement);
				});
				if (config.DEBUG) ConsoleManager.log(filePath, ConsoleColors.GREEN);
			}

			// Add registry to the list
			this.registryList.set(registryName, {
				entries: entries
			});
		});
	}

	/**
	 * Get a registry
	 */
	private get(registryName: string): IRegistry {
		if (this.exists(registryName)) {
			return <IRegistry>this.registryList.get(registryName);
		} else throw new Error("Registry " + registryName + " is not a valid registry");
	}

	/**
	 * Check if a registry exists
	 */
	private exists(registryName: string): boolean {
		return this.registryList.has(registryName);
	}

	/**
	 * Get all elements from a registry
	 */
	private getElements(registryName: string): Map<string, RegistryElement> {
		let registry: IRegistry = this.get(registryName);
		return registry.entries;
	}

}
