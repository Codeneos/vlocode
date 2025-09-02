import { inject } from "../di/inject.decorator";
import { injectable } from "../di/injectable.decorator";
import { ServiceImplCircular } from "./container.test.circular";

@injectable()
export class CircularRef {
    constructor(
        @inject(() => ServiceImplCircular) public parent: ServiceImplCircular
    ) {
    }
}