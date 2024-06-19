//
// ObjectUtils.ts
//

export default class ObjectUtils {

	constructor() {
	}

	/**
	 * Merge two objects
	 */
	public static merge(object0: object, object1: object): object {
		return Object.assign(Object.assign({}, object0), object1);
	}
}
