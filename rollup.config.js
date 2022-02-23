/* eslint-disable @typescript-eslint/no-require-imports */
import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
const packagesDir = path.resolve(__dirname, 'packages') // packages
const packageDir = path.resolve(packagesDir, '')
const resolve = (p) => path.resolve(packageDir, p)

export default [createConfig()]

function createConfig() {
	const deleteLog = {
		name: 'deleteLog',
		transform(code) {
			// logger.debug('插件失去焦点blur')
			const reg = /logger\.(debug|error|warn|trace|info)\(.*\)+?/g
			console.dir(code.match(reg))
			return {
				code: code.replace(reg, ''),
			}
		},
	}

	// rollup-plugin-terser

	const tsPlugin = typescript({
		check: true,
		tsconfig: path.resolve(__dirname, 'tsconfig.json'),
		cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
		tsconfigOverride: {
			compilerOptions: {
				sourceMap: true,
				declaration: true,
				declarationMap: true,
			},
			exclude: ['**/__tests__', 'test-dts'],
		},
	})

	return {
		input: resolve('src/index.ts'),

		plugins: [
			tsPlugin,
			deleteLog, // 删除log
			terser({
				// module: /^esm/.test(format),
				compress: {
					ecma: 2020,
					pure_getters: true,
					drop_console: true,
					drop_debugger: true,
				},
				safari10: true,
			}),
		],
		output: {
			exports: 'auto',
			name: 'edit',
			sourcemap: true,
			file: resolve('./../dist/index.js'),
			format: 'es',
		},
		onwarn: (msg, warn) => {
			if (!/Circular/.test(msg)) {
				warn(msg)
			}
		},
		treeshake: {
			moduleSideEffects: false,
		},
	}
}
