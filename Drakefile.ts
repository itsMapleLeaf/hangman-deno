import { run, sh, task } from "https://deno.land/x/drake@v1.0.0/mod.ts"

task("dev", [], async () => {
  await sh('drun --entryPoint=src/main.ts --cwd=./')
})

task("dev", [], async () => {
  await sh('drun --entryPoint=src/main.ts --cwd=./')
})

task("start", [], async () => {
  await sh('deno run --allow-read --allow-net src/main.ts')
})

run()
