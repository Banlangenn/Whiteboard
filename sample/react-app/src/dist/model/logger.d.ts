declare class Logger {
    private readonly logMethods;
    private readonly levels;
    trace(...arg: any[]): void;
    debug(...arg: any[]): void;
    info(...arg: any[]): void;
    warn(...arg: any[]): void;
    error(...arg: any[]): void;
    enableAll(): void;
    disableAll(): void;
    setLevel(levelGrade: number | string): "No console available for logging" | undefined;
    realMethod(name: string): any;
}
export default Logger;
//# sourceMappingURL=logger.d.ts.map