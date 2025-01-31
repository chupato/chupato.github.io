import { dlls } from './launcher/dll.ts'

const includedFiles = [...dlls.map(n => `${n}.dll`), 'worker.ts']
new Deno.Command('deno', {
	stderr: 'inherit',
	stdout: 'inherit',
	args: [
		'compile',
		/* '--no-terminal', */
		'--no-check',
		'--vendor',
		...includedFiles.flatMap(n => ['--include', `./launcher/${n}`]),
		...['--target', 'x86_64-pc-windows-msvc'],
		...['--icon', './launcher/icon.ico'],
		...['-A', './launcher/launcher.ts'],
	]
}).outputSync()
