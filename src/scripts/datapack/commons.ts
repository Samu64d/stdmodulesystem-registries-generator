//
// commons.ts
//

export enum ResourceTypes {
	FUNCTIONS,
	TAGS
}

export enum TagTypes {
	BLOCK,
	FLUID,
	ITEM,
	ENTITY_TYPE,
	BIOME
}

export const ResourceTypeToFolderName: Map<ResourceTypes, string> = new Map([
	[ResourceTypes.FUNCTIONS, "function"],
	[ResourceTypes.TAGS, "tags"]
]);

export const FolderNameToResourceType: Map<string, ResourceTypes> = new Map([
	["function", ResourceTypes.FUNCTIONS],
	["tags", ResourceTypes.TAGS]
]);

export const ResourceTypeToExtensions: Map<ResourceTypes, string> = new Map([
	[ResourceTypes.FUNCTIONS, "mcfunction"],
	[ResourceTypes.TAGS, "json"]
]);

export const TagTypeToFolderName: Map<TagTypes, string> = new Map([
	[TagTypes.BLOCK, "block"],
	[TagTypes.FLUID, "fluid"],
	[TagTypes.ITEM, "item"],
	[TagTypes.ENTITY_TYPE, "entity_type"],
	[TagTypes.BIOME, "worldgen/biome"]
]);

export const FolderNameToTagType: Map<string, TagTypes> = new Map([
	["block", TagTypes.BLOCK],
	["fluid", TagTypes.FLUID],
	["item", TagTypes.ITEM],
	["entity_type", TagTypes.ENTITY_TYPE],
	["worldgen/biome", TagTypes.BIOME],
]);
