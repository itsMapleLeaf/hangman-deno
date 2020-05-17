import { run, sh, task } from "https://deno.land/x/drake@v1.0.0/mod.ts"

task("dev", [], async () => {
  const runOptions: Deno.RunOptions = {
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-net",
      "--allow-env",
      "src/main.ts",
    ],
  }
  let process = Deno.run(runOptions)

  for await (const change of Deno.watchFs("src", { recursive: true })) {
    process.close()
    process = Deno.run(runOptions)
  }
})

task("start", [], async () => {
  await sh("deno run --allow-read --allow-net --allow-env src/main.ts")
})

task("format", [], async () => {
  await sh("prettier --write .")
})

run()
