//
// commons.ts
//

import { TagTypes } from "../datapack/commons";

export type RegistryPropValue = number | boolean;

export type RegistrySelector = string;

export type RegistrySelectorElement = Record<string, RegistryPropValue>;

export interface IRegistryData {
	entries: Record<RegistrySelector, RegistrySelectorElement>
}

export type RegistryElement = Record<string, RegistryPropValue>

export interface IRegistry {
	entries: Map<string, RegistryElement>
}

export const ElementTypeTags: Map<string, TagTypes> = new Map([
	["minecraft:block", TagTypes.BLOCK],
	["minecraft:fluid", TagTypes.FLUID],
	["minecraft:item", TagTypes.ITEM],
	["minecraft:entity_type", TagTypes.ENTITY_TYPE],
	["minecraft:biome", TagTypes.BIOME]
]);
