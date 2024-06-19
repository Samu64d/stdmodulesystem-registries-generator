//
// DatapackManager.ts
//

import { TagTypes } from "./commons";
import DatapackLoader from "./DatapackLoader";
import DatapackGenerator from "./DatapackGenerator";
import MultiDatapackLoader from "./MultiDatapackLoader";

interface IFunction {
	text: string
}

interface ITag {
	values: Array<string>
}

interface ITagGroup {
	tags: Map<string, ITag>
}

interface IDatapackData {
	functions: Map<string, IFunction>,
	tagGroups: Map<TagTypes, ITagGroup>
}

export default class DatapackManager {

	// Datapack name
	private name: string;

	// Datapack data
	private data: IDatapackData;

	constructor(datapackName: string = "datapack") {
		this.name = datapackName;
		this.data = {
			functions: new Map<string, IFunction>(),
			tagGroups: new Map<TagTypes, ITagGroup>()
		};
	}

	/**
	 * Load the datapack data from a single saved datapack
	 */
	public load(pathName: string): void {
		let loader: DatapackLoader = new DatapackLoader(this, pathName);
		loader.load();
	}

	/**
	 * Load the datapack data from multiple saved datapacks
	 */
	public multiload(pathName: string): void {
		let loader: MultiDatapackLoader = new MultiDatapackLoader(this, pathName);
		loader.load();
	}

	/**
	 * Save the datapack data on the file system
	 */
	public save(pathName: string): void {
		let generator: DatapackGenerator = new DatapackGenerator(this, pathName);
		generator.generate();
	}

	/**
	 * Get datapack name
	 */
	public getName(): string {
		return this.name;
	}

	/**
	 * Iterate over all functions
	 */
	public forEachFunction(callback: Function): void {
		let functions: Map<string, IFunction> = this.getFunctions();
		functions.forEach((function_: IFunction, functionName: string) => {
			callback(functionName);
		});
	}

	/**
	 * Get a function contents
	 */
	public getFunctionContents(functionName: string): string {
		let function_: IFunction = this.getFunction(functionName);
		return function_.text;
	}

	/**
	 * Create a new function
	 */
	public createFunction(functionName: string, functionContents: string = ""): void {
		let functions: Map<string, IFunction> = this.getFunctions();
		let function_: IFunction = {
			text: functionContents
		}
		functions.set(functionName, function_);
	}

	/**
	 * Check if a function exists
	 */
	public existsFunction(functionName: string): boolean {
		let functions: Map<string, IFunction> = this.getFunctions();
		return functions.has(functionName);
	}

	/**
	 * Iterate over all tag groups
	 */
	public forEachTagGroup(callback: Function): void {
		let tagGroups: Map<TagTypes, ITagGroup> = this.getTagGroups();
		tagGroups.forEach((tagGroup: ITagGroup, tagType: TagTypes) => {
			callback(tagType);
		});
	}

	/**
	 * Check if a tag group exists
	 */
	public existsTagGroup(tagType: TagTypes): boolean {
		let tags: Map<TagTypes, ITagGroup> = this.getTagGroups();
		return tags.has(tagType);
	}

	/**
	 * Iterate over all tags
	 */
	public forEachTag(tagType: TagTypes, callback: Function): void {
		if (!this.existsTagGroup(tagType)) return;
		let tags: Map<string, ITag> = this.getTags(tagType);
		tags.forEach((tag: ITag, tagName: string) => {
			callback(tagName);
		});
	}

	/**
	 * Get a list of tag elements
	 */
	public getTagElements(tagType: TagTypes, tagName: string): Array<string> {
		let tag: ITag = this.getTag(tagType, tagName);
		return tag.values;
	}

	/**
	 * Get a list of unpacked tag elements
	 */
	public getUnpackedTagElements(tagType: TagTypes, tagName: string, visited: Set<string> = new Set()): Array<string> {
		let tag: ITag = this.getTag(tagType, tagName);
		let packedTags: Array<string> = tag.values;
		let unpackedTags: Array<string> = new Array();
		visited.add(tagName);
		for (let elementName of packedTags) {
			if (elementName.startsWith("#")) {
				elementName = elementName.slice(1);
				if (!visited.has(elementName)) {
					let tags: Array<string> = this.getUnpackedTagElements(tagType, elementName, visited);
					unpackedTags.push(...tags);
				} else throw new Error("Circular reference detected in tag \"" + tagName + "\"");
			} else {
				unpackedTags.push(elementName);
			}
		}
		return unpackedTags;
	}

	/**
	 * Create a tag inside a tag group
	 */
	public createTag(tagType: TagTypes, tagName: string, values: Array<string>): void {
		if (!this.existsTagGroup(tagType)) this.createTagGroup(tagType);
		let tag: ITag = {
			values: values
		}
		let tags: Map<string, ITag> = this.getTags(tagType);
		tags.set(tagName, tag);
	}

	/**
	 * Update a tag inside a tag group
	 */
	public updateTag(tagType: TagTypes, tagName: string, values: Array<string>, replace: boolean = false): void {
		if (!this.existsTag(tagType, tagName) || replace) {
			this.createTag(tagType, tagName, values);
		} else {
			let oldValues: Array<string> = this.getTagElements(tagType, tagName);
			let tag: ITag = {
				values: DatapackManager.mergeTagValues(oldValues, values)
			}
			let tags: Map<string, ITag> = this.getTags(tagType);
			tags.set(tagName, tag);
		}
	}

	/**
	 * Check if a tag exists inside a tag group
	 */
	public existsTag(tagType: TagTypes, tagName: string): boolean {
		return this.existsTagGroup(tagType) && this.getTags(tagType).has(tagName);
	}

	/**
	 * Get all functions
	 */
	private getFunctions(): Map<string, IFunction> {
		return this.data.functions;
	}

	/**
	 * Get a function
	 */
	private getFunction(functionName: string): IFunction {
		let functions: Map<string, IFunction> = this.getFunctions();
		if (functions.has(functionName)) {
			return <IFunction>functions.get(functionName);
		} else throw new Error("Unknow function \"" + functionName + "\"");
	}

	/**
	 * Get all tag groups
	 */
	private getTagGroups(): Map<TagTypes, ITagGroup> {
		return this.data.tagGroups;
	}

	/**
	 * Get a tag group
	 */
	private getTagGroup(tagType: TagTypes): ITagGroup {
		let tagGroups: Map<TagTypes, ITagGroup> = this.getTagGroups();
		if (tagGroups.has(tagType)) {
			return <ITagGroup>tagGroups.get(tagType);
		} else throw new Error("Unknow tag group \"" + tagType + "\"");
	}

	/**
	 * Create a tag group
	 */
	private createTagGroup(tagType: TagTypes): void {
		let tags: Map<TagTypes, ITagGroup> = this.getTagGroups();
		let tagGroup: ITagGroup = {
			tags: new Map<string, ITag>()
		}
		tags.set(tagType, tagGroup);
	}

	/**
	 *  Get all tags from a tag group
	 */
	private getTags(tagType: TagTypes): Map<string, ITag> {
		let tagGroup: ITagGroup = this.getTagGroup(tagType);
		return tagGroup.tags;
	}

	/**
	 * Get a tag from a tag group
	 */
	private getTag(tagType: TagTypes, tagName: string): ITag {
		let tags: Map<string, ITag> = this.getTags(tagType);
		if (tags.has(tagName)) {
			return <ITag>tags.get(tagName);
		} else throw new Error("Unknow tag \"" + tagName + "\"");
	}

	/**
	 * Merge two tag value arrays
	 */
	private static mergeTagValues(values0: Array<string>, values1: Array<string>): Array<string> {
		let mergedValues: Array<string> = [...values0];
		for (let value of values1) {
			if (!mergedValues.includes(value)) mergedValues.push(value);
		}
		return mergedValues;
	}

}
