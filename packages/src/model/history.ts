import { properties } from './../render/Symbols//Shape'
import { cloneDeep } from './../utils/index'
// import {}
type Mutable<T> = {
	-readonly [P in keyof T]: T[P]
}
export interface HistoryEntry {
	appState: ReturnType<typeof clearAppStatePropertiesForHistory>
	elements: properties[]
}

interface DehydratedpropertiesElement {
	id: string
	versionNonce: number
}

interface DehydratedHistoryEntry {
	appState: string
	elements: DehydratedpropertiesElement[]
}

interface AppState {
	selectedElementIds: Record<string, boolean>
	viewBackgroundColor?: string
	name: string
}

const clearAppStatePropertiesForHistory = (appState: AppState) => {
	return {
		selectedElementIds: appState.selectedElementIds,
		// selectedGroupIds: appState.selectedGroupIds,
		viewBackgroundColor: appState.viewBackgroundColor,
		// editingLinearElement: appState.editingLinearElement,
		// editingGroupId: appState.editingGroupId,
		name: appState.name,
	}
}
export class History {
	private elementCache = new Map<string, Map<number, properties>>()
	private stateHistory: DehydratedHistoryEntry[] = []
	private redoStack: DehydratedHistoryEntry[] = []
	private lastEntry: HistoryEntry | null = null

	clear() {
		this.stateHistory.length = 0
		this.redoStack.length = 0
		this.lastEntry = null
		this.elementCache.clear()
	}

	get canUndo() {
		return this.stateHistory.length !== 1
	}

	get canRedo() {
		return this.redoStack.length !== 0
	}
	// 场景是 选中显示没有偏移这种就不进 记录
	shouldCreateEntry(nextEntry: HistoryEntry): boolean {
		const { lastEntry } = this
		if (!lastEntry) {
			return true
		}

		if (nextEntry.elements.length !== lastEntry.elements.length) {
			return true
		}

		// loop from right to left as changes are likelier to happen on new elements
		for (let i = nextEntry.elements.length - 1; i > -1; i--) {
			const prev = nextEntry.elements[i]
			const next = lastEntry.elements[i]

			if (
				!prev ||
				!next ||
				prev.id !== next.id ||
				prev.versionNonce !== next.versionNonce
			) {
				return true
			}
		}

		// note: this is safe because entry's appState is guaranteed no excess props
		// let key: keyof typeof nextEntry.appState
		// for (key in nextEntry.appState) {
		// 	if (key === 'editingLinearElement') {
		// 		if (
		// 			nextEntry.appState[key]?.elementId ===
		// 			lastEntry.appState[key]?.elementId
		// 		) {
		// 			continue
		// 		}
		// 	}
		// 	if (key === 'selectedElementIds' || key === 'selectedGroupIds') {
		// 		continue
		// 	}
		// 	if (nextEntry.appState[key] !== lastEntry.appState[key]) {
		// 		return true
		// 	}
		// }

		return false
	}

	pushEntry(appState: AppState, elements: readonly properties[]) {
		// console.log(this.elementCache.get())
		// console.log(
		// 	JSON.stringify(
		// 		this.stateHistory[this.stateHistory.length - 1]?.elements?.map((e) => {
		// 			return this.elementCache.get(e.id)?.get(e.versionNonce)
		// 		}),
		// 	),
		// 	'\n-------分隔线--------\n',
		// )
		const newEntryDehydrated = this.generateEntry(appState, elements)
		const newEntry: HistoryEntry = this.hydrateHistoryEntry(newEntryDehydrated)
		if (newEntry) {
			if (!this.shouldCreateEntry(newEntry)) {
				return
			}

			this.stateHistory.push(newEntryDehydrated)
			this.lastEntry = newEntry
			// As a new entry was pushed, we invalidate the redo stack
			this.clearRedoStack()
		}
	}

	clearRedoStack() {
		this.redoStack.splice(0, this.redoStack.length)
	}

	redoOnce(): HistoryEntry | null {
		if (this.redoStack.length === 0) {
			return null
		}
		const entryToRestore = this.redoStack.pop()

		if (entryToRestore !== undefined) {
			this.stateHistory.push(entryToRestore)
			return this.hydrateHistoryEntry(entryToRestore)
		}

		return null
	}

	undoOnce(): HistoryEntry | null {
		if (this.stateHistory.length === 1) {
			return null
		}

		const currentEntry = this.stateHistory.pop()

		const entryToRestore = this.stateHistory[this.stateHistory.length - 1]

		if (currentEntry !== undefined) {
			this.redoStack.push(currentEntry)
			return this.hydrateHistoryEntry(entryToRestore)
		}

		return null
	}

	/**
	 * Updates history's `lastEntry` to latest app state. This is necessary
	 *  when doing undo/redo which itself doesn't commit to history, but updates
	 *  app state in a way that would break `shouldCreateEntry` which relies on
	 *  `lastEntry` to reflect last comittable history state.
	 * We can't update `lastEntry` from within history when calling undo/redo
	 *  because the action potentially mutates appState/elements before storing
	 *  it.
	 */
	setCurrentState(appState: AppState, elements: readonly properties[]) {
		this.lastEntry = this.hydrateHistoryEntry(
			this.generateEntry(appState, elements),
		)
	}

	private hydrateHistoryEntry({
		appState,
		elements,
	}: DehydratedHistoryEntry): HistoryEntry {
		return {
			appState: JSON.parse(appState),
			elements: elements.map((el) => {
				const element = this.elementCache.get(el.id)?.get(el.versionNonce)
				if (!element) {
					throw new Error(`Element not found: ${el.id}:${el.versionNonce}`)
				}
				return element
			}),
		}
	}

	private dehydrateHistoryEntry({
		appState,
		elements,
	}: HistoryEntry): DehydratedHistoryEntry {
		return {
			appState: JSON.stringify(appState),
			elements: elements.map((element: properties) => {
				if (!this.elementCache.has(element.id)) {
					this.elementCache.set(element.id, new Map())
				}
				const versions = this.elementCache.get(element.id)!
				if (!versions.has(element.versionNonce)) {
					versions.set(element.versionNonce, cloneDeep(element))
				}
				return {
					id: element.id,
					versionNonce: element.versionNonce,
				}
			}),
		}
	}

	private generateEntry = (
		appState: AppState,
		elements: readonly properties[],
	): DehydratedHistoryEntry =>
		this.dehydrateHistoryEntry({
			appState: clearAppStatePropertiesForHistory(appState),
			elements: elements as Mutable<typeof elements>,
		})
}

export default History
