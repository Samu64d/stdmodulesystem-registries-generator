//
// RegistryProvider.ts
//

import * as config from "../config/config";
import FsUtils from "../utils/FsUtils";
import ConsoleManager, { ConsoleColors } from "../utils/ConsoleManager";

type IReportData = Record<string, {
    protocol_id: number,
    entries: Record<string, { protocol_id: number }>
    default?: string
}>

interface IRegistryElement {
    id: number
}

interface IRegistry {
    entries: Map<string, IRegistryElement>
}

export default class RegistryProvider {

    // Registries file name
    private static readonly REGISTRIES_FILE_NAME: string = "registries.json";

    // Default registry namespace
    private static readonly DEFAULT_NAMESPACE: string = "minecraft";

    // Registry list
    private registryList: Map<string, IRegistry>;

    constructor() {
        this.registryList = new Map<string, IRegistry>();
    }

    /**
     * Load data
     */
    public load(dataPath: string): void {

        // Load data from file
        let filePath: string = dataPath + "/reports/" + RegistryProvider.REGISTRIES_FILE_NAME;
        this.loadOrUpdateFromFile(filePath);

        // Load data from folders
        let worldgenFolderPath: string = dataPath + "/" + "data";
        let namespaceNames: string[] = FsUtils.getFolderElements(worldgenFolderPath);
        for (let namespaceName of namespaceNames) {
            let biomeFolderPath: string = worldgenFolderPath + "/" + namespaceName + "/worldgen/biome";
            this.loadOrUpdateFromFolder(biomeFolderPath, namespaceName, RegistryProvider.DEFAULT_NAMESPACE + ":" + "biome");
        }
    }

    /**
     * Iterate over all elements of a registry
     */
    public forEachRegistryElement(registryName: string, callback: Function): void {
        let elements: Map<string, IRegistryElement> = this.getRegistryElements(registryName);
        elements.forEach((element: IRegistryElement, elementName: string) => {
            callback(elementName);
        });
    }

    /**
     * Get the element id of a registry element
     */
    public getRegistryElementId(registryName: string, elementName: string): number {
        let element: IRegistryElement = this.getRegistryElement(registryName, elementName);
        return element.id;
    }

    /**
     * Check if an element exists inside a registry
     */
    public existsRegistryElement(registryName: string, elementName: string): boolean {
        let elements: Map<string, IRegistryElement> = this.getRegistryElements(registryName);
        return elements.has(elementName);
    }

    /**
     * Get all elements from a registry
     */
    public getRegistryElements(registryName: string): Map<string, IRegistryElement> {
        if (this.registryList.has(registryName)) {
            return (<IRegistry>this.registryList.get(registryName)).entries;
        } else throw new Error("Unknow Minecraft registry \"" + registryName + "\"");
    }

    /**
     * Get a registry element
     */
    public getRegistryElement(registryName: string, elementName: string): IRegistryElement {
        let elements: Map<string, IRegistryElement> = this.getRegistryElements(registryName);
        if (this.existsRegistryElement(registryName, elementName)) {
            return <IRegistryElement>elements.get(elementName);
        } else throw new Error("Unknow Minecraft registry element \"" + elementName + "\"");
    }

    /**
     * Create a registry if not exists
     */
    private createRegistryIfNotExists(registryName: string): void {
        if (!this.registryList.has(registryName)) {
            this.registryList.set(registryName, {
                entries: new Map<string, IRegistryElement>()
            });
        }
    }

    /**
     * Load a group of registries from a file
     */
    private loadOrUpdateFromFile(filePath: string): void {
        let reports: IReportData = <IReportData>FsUtils.readJSONFile(filePath);
        for (let registryName in reports) {
            this.createRegistryIfNotExists(registryName);
            let reportEntries = reports[registryName].entries;

            // Unknow element
            (<IRegistry>this.registryList.get(registryName)).entries.set("unknow", {
                id: 0
            });

            for (let elementName in reportEntries) {
                let id: number = reportEntries[elementName].protocol_id + 1;
                (<IRegistry>this.registryList.get(registryName)).entries.set(elementName, {
                    id: id
                });
            }
        }
        if (config.DEBUG) ConsoleManager.log(filePath, ConsoleColors.GREEN);
    }

    /**
     * Load or update a registry from a folder
     */
    private loadOrUpdateFromFolder(folderPath: string, namespaceName: string, registryName: string): void {
        this.createRegistryIfNotExists(registryName);

        // Unknow element
        (<IRegistry>this.registryList.get(registryName)).entries.set("unknow", {
            id: 0
        });

        let files: string[] = FsUtils.getFolderElements(folderPath);
        for (let index in files) {
            let name: string = namespaceName + ":" + FsUtils.removeExtension(files[index]);
            (<IRegistry>this.registryList.get(registryName)).entries.set(name, {
                id: parseInt(index) + 1
            });
        }
        if (config.DEBUG) ConsoleManager.log(folderPath, ConsoleColors.GREEN);
    }

}
