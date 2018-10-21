'use strict';
export default interface CommandModel {
    name: string;
    callback: (... args) => void;
}
