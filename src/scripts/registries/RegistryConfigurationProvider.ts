//
// RegistryConfigurationProvider.ts
//

import * as config from "../config/config";
import FsUtils from "../utils/FsUtils";
import ConsoleManager, { ConsoleColors } from "../utils/ConsoleManager";
import { TagTypes } from "../datapack/commons";
import { PropType, PropTypeSizes, PropTypeSigns } from "./propType";
import { RegistryPropValue, ElementTypeTags } from "./commons";
import RegistryProvider from "./RegistryProvider";

export interface IPropConfigData {
    name: string,
    type: PropType
}

export interface IRegistryConfigData {
    name: string,
    type: string,
    pool: string,
    props: Array<IPropConfigData>
}

interface IRegistryConfigsData {
    data_version: number,
    registries: Array<IRegistryConfigData>
}

export interface IPropConfig {
    type: PropType
}

interface IRegistryConfig {
    elementType: string,
    elementTagType: TagTypes,
    elementPool: Array<string>,
    props: Map<string, IPropConfig>
}

interface IRegistryConfigs {
    dataVersion: number,
    registries: Map<string, IRegistryConfig>
}

export default class RegistryConfigurationProvider {

    // Registry configurationuration file name
    private static readonly CONFIG_FILE_NAME: string = "registries.json";

    // Registry default element name
    private static readonly DEFAULT_POOL_SELECTOR: string = "default";
    private static readonly EMPTY_POOL_SELECTOR: string = "empty";

    // Registry provider
    private registries: RegistryProvider;

    // Registry configuration
    private configs: IRegistryConfigs;

    constructor(registries: RegistryProvider) {
        this.registries = registries;
        this.configs = {
            dataVersion: -1,
            registries: new Map<string, IRegistryConfig>()
        }
    }

    /**
     * Load all registry configurations
     */
    public load(dataPath: string): void {
        let filePath: string = dataPath + "/" + RegistryConfigurationProvider.CONFIG_FILE_NAME;
        let registriesConfig: IRegistryConfigsData = (<any>FsUtils.readJSONFile(filePath));
        this.configs.dataVersion = registriesConfig.data_version;
        for (let element of registriesConfig.registries) {

            let registryName: string = element.name;

            // Build props
            let props: Map<string, IPropConfig> = new Map<string, IPropConfig>();
            for (let prop of element.props) {
                props.set(prop.name, {
                    type: prop.type
                });
            }

            let elementType: string = element.type;
            let elementTagType: TagTypes = <TagTypes>ElementTypeTags.get(elementType);
            if (!elementTagType) new Error("Unknow registry element type \"" + elementTagType + "\"");

            // Build element pool
            let selector: string = element.pool || RegistryConfigurationProvider.DEFAULT_POOL_SELECTOR;
            let elementPool: Array<string> = new Array<string>();
            if (selector === RegistryConfigurationProvider.DEFAULT_POOL_SELECTOR) {
                this.registries.getReports().getRegistries().forEachRegistryElement(elementType, (elementName: string) => {
                    elementPool.push(elementName);
                });
            } else if (selector === RegistryConfigurationProvider.EMPTY_POOL_SELECTOR) {
                // Empty pool
            } else if (selector.startsWith("#")) {
                elementPool.push(...this.registries.getDatapack().getUnpackedTagElements(elementTagType, selector.slice(1)));
            } else throw new Error("Invalid element pool selector in registry \"" + registryName + "\"");

            // Create configuration
            this.configs.registries.set(registryName, {
                props: props,
                elementType: elementType,
                elementTagType: elementTagType,
                elementPool: elementPool
            });
        }
        if (config.DEBUG) ConsoleManager.log(filePath, ConsoleColors.GREEN);
    }

    /**
     * Get data version
     */
    public getDataVersion(): number {
        return this.configs.dataVersion;
    }

    /**
     * Iterate over all registry configurations
     */
    public forEach(callback: Function): void {
        let configs: Map<string, IRegistryConfig> = this.configs.registries;
        configs.forEach((config: IRegistryConfig, registryName: string) => {
            callback(registryName);
        });
    }

    /**
     * Iterate over all registry elements
     */
    public forEachElement(registryName: string, callback: Function): void {
        let elements: Array<string> = this.getElementPool(registryName);
        elements.forEach((elementName: string) => {
            callback(elementName);
        });
    }

    /**
     * Iterate over all props of a registry configuration
     */
    public forEachProp(registryName: string, callback: Function): void {
        let props: Map<string, IPropConfig> = this.getProps(registryName);
        props.forEach((config: IPropConfig, propName: string) => {
            callback(propName);
        });
    }

    /**
     * Check if a property exists
     */
    public hasProp(registryName: string, propName: string): boolean {
        let props: Map<string, IPropConfig> = this.getProps(registryName);
       return props.has(propName);
    }

    /**
     * Get the size of a property
     */
    public getPropType(registryName: string, propName: string): PropType {
        let prop: IPropConfig = this.getProp(registryName, propName);
        return prop.type;
    }

    /**
     * Check it the property is an id type
     */
    public isPropIdType(registryName: string, propName: string): boolean {
        let prop: IPropConfig = this.getProp(registryName, propName);
        return prop.type === "id";
    }

    /**
     * Get the size of a property
     */
    public getPropSize(registryName: string, propName: string): number {
        return <number>PropTypeSizes.get(this.getPropType(registryName, propName));
    }

    /**
     * Check if a property is signed
     */
    public getPropSign(registryName: string, propName: string): boolean {
        return <boolean>PropTypeSigns.get(this.getPropType(registryName, propName));
    }

    /**
     * Denormalize a property value
     */
    public static denormalizePropValue(propValue: RegistryPropValue, propSize: number, propSign: boolean): RegistryPropValue {
        if (propSign && propSize > 1) {
            propValue = <number>propValue + (2 ** (propSize - 1));
        }
        return propValue;
    }

    /**
     * Get the element type of a registry configuration
     */
    public getElementType(registryName: string): string {
        let config: IRegistryConfig = this.getRegistry(registryName);
        return config.elementType;
    }

    /**
     * Get the element tag type of a registry configuration
     */
    public getElementTagType(registryName: string): TagTypes {
        let config: IRegistryConfig = this.getRegistry(registryName);
        return config.elementTagType;
    }

    /**
     * Get the element type of a registry configuration
     */
    public getElementPool(registryName: string): Array<string> {
        let config: IRegistryConfig = this.getRegistry(registryName);
        return config.elementPool;
    }

    /**
     * Check if an element exists in a registry
     */
    public existsElement(registryName: string, elementName: string): boolean {
        let elements: Array<string> = this.getElementPool(registryName);
        return elements.includes(elementName);
    }

    /**
     * Get a registry configuration
     */
    private getRegistry(registryName: string): IRegistryConfig {
        if (this.exists(registryName)) {
            return <IRegistryConfig>this.configs.registries.get(registryName);
        } else throw new Error("Registry configurationuration for registry \"" + registryName + "\" is not a valid registry configurationuration")
    }

    /**
     * Check if a registry configuration exists
     */
    private exists(registryName: string): boolean {
        return this.configs.registries.has(registryName);
    }

    /**
     * Get the props configuration of a registry configuration
     */
    private getProps(registryName: string): Map<string, IPropConfig> {
        let config: IRegistryConfig = this.getRegistry(registryName);
        return config.props;
    }

    /**
     * Get a prop configuration of a registry configuration
     */
    private getProp(registryName: string, propName: string): IPropConfig {
        let props: Map<string, IPropConfig> = this.getProps(registryName);
        if (props.has(propName)) {
            return <IPropConfig>props.get(propName);
        } else throw new Error("Unknow property \"" + propName + "\"");
    }

}
