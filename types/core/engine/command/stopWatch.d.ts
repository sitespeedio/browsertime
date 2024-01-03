export class StopWatch {
    constructor(name: any, measure: any);
    name: any;
    measure: any;
    /**
     * Start the the stop watch
     */
    start(): void;
    /**
     * Stop the watch and automatically add the time to the
     * last measured page. If no page has been measured you will get
     * an error in your log.
     * @returns the measured time
     */
    stopAndAdd(): number;
    /**
     * Stop the watch
     * @returns the measured time
     */
    stop(): number;
    /**
     * Get the name of the watch.
     * @returns The name of the watch
     */
    getName(): any;
}
export class Watch {
    constructor(measure: any);
    measure: any;
    get(name: any): StopWatch;
}
//# sourceMappingURL=stopWatch.d.ts.map