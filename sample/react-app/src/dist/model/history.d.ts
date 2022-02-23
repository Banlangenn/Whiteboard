import { properties } from './../render/Symbols//Shape';
export interface HistoryEntry {
    appState: ReturnType<typeof clearAppStatePropertiesForHistory>;
    elements: properties[];
}
interface AppState {
    selectedElementIds: Record<string, boolean>;
    viewBackgroundColor?: string;
    name: string;
}
declare const clearAppStatePropertiesForHistory: (appState: AppState) => {
    selectedElementIds: Record<string, boolean>;
    viewBackgroundColor: string | undefined;
    name: string;
};
export declare class History {
    private elementCache;
    private stateHistory;
    private redoStack;
    private lastEntry;
    clear(): void;
    get canUndo(): boolean;
    get canRedo(): boolean;
    shouldCreateEntry(nextEntry: HistoryEntry): boolean;
    pushEntry(appState: AppState, elements: readonly properties[]): void;
    clearRedoStack(): void;
    redoOnce(): HistoryEntry | null;
    undoOnce(): HistoryEntry | null;
    setCurrentState(appState: AppState, elements: readonly properties[]): void;
    private hydrateHistoryEntry;
    private dehydrateHistoryEntry;
    private generateEntry;
}
export default History;
//# sourceMappingURL=history.d.ts.map