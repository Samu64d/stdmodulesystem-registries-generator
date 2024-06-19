//
// RegistrySelectorElementParser.ts
//

import MathUtils from "../utils/MathUtils";
import ReportsProvider from "../reports/ReportsProvider";
import { RegistryPropValue, RegistrySelectorElement, RegistrySelector, RegistryElement } from "./commons";
import { PropType } from "./propType";
import RegistryProvider from "./RegistryProvider";
import RegistryConfigurationProvider from "./RegistryConfigurationProvider";

export default class RegistrySelectorElementParser {

	// Registry provider
	private registries: RegistryProvider;

	// Registry name
	private registryName: string;

	constructor(registries: RegistryProvider, registryName: string) {
		this.registries = registries;
		this.registryName = registryName;
	}

	/**
	 * Parse
	 */
	public parse(element: RegistrySelectorElement, elementName: string, selector?: RegistrySelector): RegistryElement {

		// Parsed element
		let parsedElement: RegistryElement = {};

		// Check for invalid properties
		let invalidProps: Array<string> = this.findInvalidProps(element);
		if (invalidProps.length > 0) throw new Error("Unknow property called \"" + invalidProps[0] + "\" found in the entry of the registry \"" + this.registryName + "\"" + (selector ? " at element selector \"" + selector + "\"" : ""));

		// Parse valid properties
		this.getConfig().forEachProp(this.registryName, (propName: string) => {

			if (element.hasOwnProperty(propName)) {

				// Property was found
				let propValue: RegistryPropValue = element[propName];
				if (!this.isValidPropValue(propName, propValue)) throw new Error("Wrong value for property \"" + propName + "\" found in registry \"" + this.registryName + "\" at element selector \"" + selector + "\"");
				parsedElement[propName] = propValue;

			} else if (this.getConfig().isPropIdType(this.registryName, propName)) {

				// Property is an id
				let elementId = this.getReports().getRegistries().getRegistryElementId(this.getConfig().getElementType(this.registryName), elementName);
				if (!this.isValidPropValue(propName, elementId)) throw new Error("Too many elements in registry \"" + this.registryName + "\"");
				parsedElement[propName] = elementId;

			} else if (selector != undefined) {
				// Property was not found
				throw new Error("Property \"" + propName + "\" was not found in the entry of the registry \"" + this.registryName + "\"" + (selector ? " at element selector \"" + selector + "\"" : ""));

			} else {
				throw new Error("Default selector of registry \"" + this.registryName + "\" was missing property \"" + propName + "\" when using for generate others not specified elements from the registry pool");
			}
		});

		return parsedElement;
	}

	/**
	 * Get configuration
	 */
	private getConfig(): RegistryConfigurationProvider {
		return this.registries.getConfig();
	}

	/**
	 * Get reports
	 */
	private getReports(): ReportsProvider {
		return this.registries.getReports();
	}

	/**
	 * Find invalid properties
	 */
	private findInvalidProps(element: RegistrySelectorElement): Array<string> {
		let props: Array<string> = new Array<string>();
		for (let propName in element) {
			if (!this.getConfig().hasProp(this.registryName, propName)) props.push(propName);
		}
		return props;
	}

	/**
	 * Check for valid property value
	 */
	private isValidPropValue(propName: string, propValue: RegistryPropValue): boolean {
        let propType: PropType = this.getConfig().getPropType(this.registryName, propName);
		let propSize: number = this.getConfig().getPropSize(this.registryName, propName);
		let propSign: boolean = this.getConfig().getPropSign(this.registryName, propName);
        if (propType == "real") {
            return true;
        } else {
            return MathUtils.isInteger(propValue) && MathUtils.isInRange(propValue, propSize, propSign);
        }
	}
}
