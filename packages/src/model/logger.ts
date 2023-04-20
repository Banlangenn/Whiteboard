/* ! loglevel - v1.6.7 - https://github.com/pimterry/loglevel - (c) 2020 Tim Perry - licensed MIT */

const noop = function (val?: any) {}

class Logger {
	// constructor () {}
	private readonly logMethods = ['trace', 'debug', 'info', 'warn', 'error']
	private readonly levels = {
		TRACE: 0,
		DEBUG: 1,
		INFO: 2,
		WARN: 3,
		ERROR: 4,
		SILENT: 5,
	}
	trace(...arg: any[]) {}
	debug(...arg: any[]) {}
	info(...arg: any[]) {}
	warn(...arg: any[]) {}
	error(...arg: any[]) {}

	// private currentLevel:number = 0;
	enableAll() {
		this.setLevel(this.levels.TRACE)
	}

	disableAll() {
		this.setLevel(this.levels.SILENT)
	}

	setLevel(levelGrade: number | string) {
		const levels = this.levels
		let level = levelGrade
		if (
			typeof level === 'string' &&
			(levels as any)[level.toUpperCase()] !== undefined
		) {
			level = (levels as any)[level.toUpperCase()]
		}
		if (typeof level === 'number' && level >= 0 && level <= levels.SILENT) {
			// this.currentLevel = level;
			for (let i = 0; i < this.logMethods.length; i++) {
				let methodName = this.logMethods[i]
				;(this as any)[methodName] =
					i < level ? noop : this.realMethod(methodName)
			}

			if (console === undefined && level < levels.SILENT) {
				return 'No console available for logging'
			}
		} else {
			throw new Error('log.setLevel() called with invalid level: ' + level)
		}
	}

	realMethod(name: string) {
		let methodName = name
		if (methodName === 'debug' || methodName === 'trace') {
			methodName = 'log'
		}
		if (console === undefined) {
			return false // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
		} else if ((console as any)[methodName] !== undefined) {
			return (console as any)[methodName].bind(console)
		} else if (console.log !== undefined) {
			return console.log.bind(console)
		} else {
			return noop
		}
	}
}
export default Logger
