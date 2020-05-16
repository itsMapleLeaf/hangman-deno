import { assertEquals } from "../deps/asserts.ts"
import { HangmanGame } from "./hangman-game.ts"

Deno.test("remainingLives", () => {
  const game = new HangmanGame("test", 10)
  game.guess("a")
  game.guess("b")
  game.guess("c")
  game.guess("t")

  assertEquals(game.remainingLives, 7)
})

Deno.test("wordProgress", () => {
  const game = new HangmanGame("test", 10)
  game.guess("a")
  game.guess("b")
  game.guess("c")
  game.guess("t")

  assertEquals(game.wordProgress, "t__t")
})
