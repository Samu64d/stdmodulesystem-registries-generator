//
// DatapackResourceLocation.ts
//

import * as path from "path";
import FsUtils from "../utils/FsUtils";
import { ResourceTypes, TagTypes, FolderNameToResourceType, ResourceTypeToFolderName, ResourceTypeToExtensions, FolderNameToTagType, TagTypeToFolderName } from "./commons";

export default class DatapackResourceLocation {

	// Resource namespace
	private readonly namespaceName: string;

	// Resource type
	private readonly resourceType: ResourceTypes;

	// Tag type
	private readonly tagType: TagTypes | undefined;

	// Resource name
	private readonly resourceName: string;

	constructor(namespaceName: string, resourceType: ResourceTypes, resourceName: string, tagType?: TagTypes) {
		this.namespaceName = namespaceName;
		this.resourceType = resourceType;
		this.resourceName = resourceName;
		if (tagType !== undefined) this.tagType = tagType;
	}

	/**
	 * Create a resource location from a resource path relative to the root folder of the datapack
	 */
	public static fromResourcePath(resourcePath: string, rootPath?: string): DatapackResourceLocation {

		// Get the relative path inside the datapack root folder
		if (rootPath != undefined) resourcePath = path.relative(rootPath, resourcePath);

		// Parse nodes
		let pathNodes: string[] = FsUtils.splitPath(resourcePath);
		let namespaceName: string = pathNodes[0];
		let resourceType: ResourceTypes = <ResourceTypes>FolderNameToResourceType.get(pathNodes[1]);
		let isTagResource: boolean = resourceType === ResourceTypes.TAGS;
		let tagType: TagTypes | undefined = isTagResource ? <TagTypes>FolderNameToTagType.get(pathNodes[2]) : undefined;
		let resourceName: string = FsUtils.removeExtension(path.join(...pathNodes.slice(isTagResource ? 3 : 2))).replaceAll("\\", "/");

		// Create
		return new DatapackResourceLocation(namespaceName, resourceType, resourceName, tagType);
	}

	/**
	 * Create a resource location from a resource uri
	 */
	public static fromResourceURI(resourceURI: string, resourceType: ResourceTypes, tagType?: TagTypes): DatapackResourceLocation {

		// Parse uri
		let uriNodes: string[] = resourceURI.split(":");
		let namespaceName: string = uriNodes[0];
		let resourceName: string = uriNodes[1];

		// Create
		return new DatapackResourceLocation(namespaceName, resourceType, resourceName, tagType);
	}

	/**
	 * Get the resource file path from the root of the datapack
	 */
	public getResourcePath(): string {
		let resourceTypeExtension: string = <string>ResourceTypeToExtensions.get(this.resourceType);
		let resourceTypeFolder = <string>ResourceTypeToFolderName.get(this.resourceType);
		resourceTypeFolder = this.isTagResource() ? resourceTypeFolder + "/" + <string>TagTypeToFolderName.get(<TagTypes>this.tagType) : resourceTypeFolder;
		return "./" + this.namespaceName + "/" + resourceTypeFolder + "/" + this.resourceName + "." + resourceTypeExtension;
	}

	/**
	 * Get the namespace name
	 */
	public getNamespaceName(): string {
		return this.namespaceName;
	}

	/**
	 * Get the resource type
	 */
	public getResourceType(): ResourceTypes {
		return this.resourceType;
	}

	/**
	 * Check if represent a tag resource type
	 */
	public isTagResource(): boolean {
		return this.resourceType === ResourceTypes.TAGS;
	}

	/**
	 * Get tag type
	 */
	public getTagType(): TagTypes | undefined {
		return this.tagType;
	}

	/**
	 * Get the resource name
	 */
	public getResourceName(): string {
		return this.resourceName;
	}

	/**
	 * Get the resource uri
	 */
	public getResourceURI(): string {
		return this.namespaceName + ":" + this.resourceName;
	}

}
