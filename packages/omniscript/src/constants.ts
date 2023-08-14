import { OmniScriptElementType } from "./types";

/**
 * Configuration for the OmniScript generator containing element 
 * types that cannot be used in certain parts of the script tree.
 *
 * The OmniScript generator uses this to determine if an element is located
 * in the correct part of the script tree. If an element is not supported an error will be thrown.
 *
 * Adding not supported elements into the tree can cause the OmniScript to fail at runtime due to not being able to
 * understand how to render the element. Either causing the script to load incorrectly, not load at all or 
 * get stuck on a loading screen.
 */
export const ExcludedElementTypes = {
    /**
     * Elements that cannot be a child of the type ahead block.
     */
    TypeAhead: [
        'Disclosure',
        'File',
        'Filter',
        'Image',
        'Lookup',
        'Password',
        'Signature',
        'Headline',
        'Text Block',
        'Geolocation',
        'Validation'
    ],
    /**
     * Elements that cannot be a child of the edit block.
     */
    EditBlock: [
        'Submit', 
        'Geolocation'
    ],
};

/**
 * Element types that are allowed in the root of the script tree.
 */
export const OmniScriptAllowedRootElementTypes: Array<OmniScriptElementType | RegExp> = [
    'Step',
    'OmniScript',
    /^(Set .*)$/,
    /^(.* Action)$/
];