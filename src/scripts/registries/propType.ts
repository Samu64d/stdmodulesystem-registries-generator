//
// propType.ts
//

export type PropType = "bool" | "uint6" | "uchar" | "char" | "uint16" | "int16" | "uint32" | "int32" | "real" | "id";

export const PropTypeSizes: Map<PropType, number> = new Map([
	["bool", 1],
	["uint6", 6],
	["uchar", 8],
	["char", 8],
	["uint16", 16],
	["int16", 16],
	["uint32", 32],
	["int32", 32],
    ["real", 64],
	["id", 16]
]);

export const PropTypeSigns: Map<PropType, boolean> = new Map([
	["bool", false],
	["uint6", false],
	["uchar", false],
	["char", true],
	["uint16", false],
	["int16", true],
	["uint32", false],
	["int32", true],
    ["real", true],
	["id", false]
]);
