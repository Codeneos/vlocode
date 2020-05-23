/**
 * Describes an object that can be focused (behavioral)
 */
export interface Focusable {
    /**
     * Focuses on the specified UI element
     */
    focus() : Promise<any> | any;
}