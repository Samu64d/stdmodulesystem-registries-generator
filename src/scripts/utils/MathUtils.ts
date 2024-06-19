//
// MathUtils.ts
//

export type Numeric = boolean | number;

export default class MathUtils {

    constructor() {
    }

    /**
     * Check if a value is a numeric value
     */
    public static isNumericValue(value: Numeric): boolean {
        return typeof value === "boolean" || typeof value === "number";
    }

    /**
     * Parse a numeric value into a number
     */
    public static parseNumeric(value: Numeric): number {
        if (MathUtils.isNumericValue(value)) {
            if (typeof value === "boolean") {
                return value ? 1 : 0;
            } else if (typeof value === "number") {
                return value;
            }
        } throw new Error("\"" + value + "\" is an invalid numeric variable");
    }

    /**
     * Check if a numeric value is an integer
     */
    public static isInteger(value: Numeric): boolean {
        value = MathUtils.parseNumeric(value);
        return Number.isInteger(value);
    }

    /**
     * Check if a numeric value is a real
     */
    public static isReal(value: Numeric): boolean {
        return !Number.isInteger(value);
    }

    /**
     * Get the value of the n-th bit of a numeric value
     */
    public static getBit(value: Numeric, bit: number): number {
        value = MathUtils.parseNumeric(value);
        return (<number>value >>> bit) % 2;
    }

    /**
     * Check if a numeric value is inside a range represented by an n number of bits
     */
    public static isInRange(value: Numeric, bits: number, sign: boolean = false): boolean {
        value = MathUtils.parseNumeric(value);
        let powdiv: number = 2 ** (bits - 1);
        let lowerLimit: number = sign ? -powdiv : 0;
        let upperLimit: number = sign ? powdiv - 1 : 2 ** bits - 1;
        return value >= lowerLimit && value <= upperLimit;
    }

}
