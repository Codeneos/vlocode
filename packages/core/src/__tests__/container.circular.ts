import { inject } from "../di/inject.decorator";
import { injectable } from "../di/injectable.decorator";
import { CircularRef } from "./container.circular.ref";

@injectable()
export class ServiceImplCircular {
    public id = 0;
    static instanceCounter = 0;
    constructor(@inject(() => CircularRef) public child: CircularRef) {
        this.id = ++ServiceImplCircular.instanceCounter;
    }
}