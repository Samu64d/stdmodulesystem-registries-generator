//
// FsUtils.ts
//

import * as fs from "fs";
import * as path from "path";

export default class FsUtils {

	constructor() {
	}

	/**
	 * Check if a path exists
	 * @param path a path
	 */
	public static pathExists(pathName: string): boolean {
		return fs.existsSync(pathName);
	}

	/**
	 * Split a path name into an array of element
	 * @param pathName path name
	 */
	public static splitPath(pathName: string): string[] {
		let parsedPath = path.parse(path.normalize(pathName));
		return [...parsedPath.dir.split("\\"), parsedPath.base];
	}

	/**
	 * Join two path name into a single path name
	 * @param rootPathName root path name
	 * @param pathName child path name
	 */
	public static joinPath(rootPathName: string, pathName: string): string {
		return "./" + path.join(rootPathName, pathName).replaceAll("\\", "/");
	}

	/**
	 * Remove the extension from a file name
	 * @param file a file name
	 */
	public static removeExtension(fileName: string): string {
		return fileName.replace(/\.[^/.]+$/, "");
	}

	/**
	 * Check if a folder exists
	 * @param folderPath a folder path
	 */
	public static folderExists(folderPath: string): boolean {
		return FsUtils.pathExists(folderPath) && FsUtils.isFolder(folderPath);
	}

	/**
	 * Check if an element path is a folder
	 * @param elementPath an element path
	 */
	public static isFolder(elementPath: string): boolean {
		return fs.lstatSync(elementPath).isDirectory();
	}

	/**
	 * Check if an element path is a file
	 * @param elementPath an element path
	 */
	public static isFile(elementPath: string): boolean {
		return fs.lstatSync(elementPath).isFile();
	}

	/**
	 * Get a list of elements inside a folder
	 * @param folderPath the path of the folder
	 */
	public static getFolderElements(folderPath: string): string[] {
		return fs.readdirSync(folderPath);
	}

	/**
	 * Scan a folder
	 * @param folderPath a folder path
	 * @param callback a callback method
	 */
	public static scanFolder(folderPath: string, callback: Function, recursive = true): void {
		let elements: string[] = FsUtils.getFolderElements(folderPath);
		for (let element of elements) {
			let elementPath = folderPath + "/" + element;
			if (FsUtils.isFile(elementPath)) {
				callback(elementPath);
			} else if (recursive && FsUtils.isFolder(elementPath)) {
				this.scanFolder(elementPath, callback);
			}
		}
	}

	/**
	 * Read a text file
	 * @param filePath the path of the file to read
	 */
	public static readTextFile(filePath: string): string {
		return fs.readFileSync(filePath, {
			encoding: "utf8"
		});
	}

	/**
	 * Write a text file
	 * @param filePath the path of the file to write
	 * @param data the string to write
	 */
	public static writeTextFile(filePath: string, data: string): void {
		var dirPath = path.dirname(filePath);
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, {
				recursive: true
			});
		}
		fs.writeFileSync(filePath, data, {
			encoding: "utf8"
		});
	}

	/**
	 * Read a JSON file
	 * @param filePath the path of the file to read
	 */
	public static readJSONFile(filePath: string): object {
		let textData = FsUtils.readTextFile(filePath);
		return JSON.parse(textData);
	}

	/**
	 * Write a JSON file
	 * @param filePath the path of the file to write
	 * @param object the JSON object to write
	 */
	public static writeJSONFile(filePath: string, object: object): void {
		let textData = JSON.stringify(object);
		FsUtils.writeTextFile(filePath, textData);
	}

}
