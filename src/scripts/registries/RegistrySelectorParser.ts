//
// RegistrySelectorParser.ts
//

import { TagTypes } from "../datapack/commons";
import { RegistrySelector } from "./commons";
import RegistryProvider from "./RegistryProvider";

export default class RegistrySelectorParser {

	// Registry provider
	private registries: RegistryProvider;

	// Registry name
	private registryName: string;

	// Registry default namespace
	private registryNamespace: string;

	constructor(registries: RegistryProvider, registryName: string, registryNamespace: string) {
		this.registries = registries;
		this.registryName = registryName;
		this.registryNamespace = registryNamespace;
	}

	/**
	 * Parse a selector
	 */
	public parse(selector: RegistrySelector): Array<string> {

		let elementNames: Array<string> = new Array();

		// Parse each component
		let selectorComponents: Array<string> = selector.includes(",") ? selector.split(",") : new Array(selector);
		selectorComponents.forEach((selectorComponent: string) => {
			elementNames.push(...this.parseComponent(selectorComponent));
		});

		// Check for valid element names
		elementNames.forEach((elementName: string) => {
			if (!this.registries.getConfig().existsElement(this.registryName, elementName)) throw new Error("Unknow element \"" + elementName + "\" found in registry \"" + this.registryName + "\" at element selector \"" + selector + "\"");
		})

		return elementNames;
	}

	/**
	 * Parse a single selector component
	 */
	private parseComponent(selectorComponent: string): Array<string> {
		let tagType: TagTypes = this.registries.getConfig().getElementTagType(this.registryName);
		let elementNames: Array<string> = new Array();
		selectorComponent = selectorComponent.trim();
		if (selectorComponent.startsWith("#")) {
			let tagElementNames: Array<string> = this.registries.getDatapack().getUnpackedTagElements(tagType, selectorComponent.slice(1));
			for (let elementName of tagElementNames) {
				elementNames.push(elementName);
			}
		} else if (selectorComponent.includes(":")) {
			elementNames.push(selectorComponent);
		} else {
			selectorComponent = this.registryNamespace + ":" + selectorComponent;
			elementNames.push(selectorComponent);
		}
		return elementNames;
	}

}
