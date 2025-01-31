import { dlls } from './launcher/dll.ts'
import { build } from './build.ts'

Deno.writeTextFileSync('./launcher.html', build({
//	minify: true
}))

const includedFiles = [...dlls.map(n => `${n}.dll`), 'worker.ts']
new Deno.Command('deno', {
	stderr: 'inherit',
	stdout: 'inherit',
	cwd: './launcher',
	args: [
		'compile',
		// '--no-terminal', // bugged, prevent the webview to appear
		'--no-check',
		'--vendor',
		...includedFiles.flatMap(n => ['--include', `./${n}`]),
		...['--target', 'x86_64-pc-windows-msvc'],
		...['--icon', './icon.ico'],
		...['-A', './launcher.ts'],
	]
}).outputSync()
