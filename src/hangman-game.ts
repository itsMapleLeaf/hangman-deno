export class HangmanGame {
  readonly guessedLetters = new Set<string>()

  constructor(
    readonly word: string,
    private readonly totalLives = 10,
  ) {}

  get remainingLives() {
    // prettier-ignore
    const guessedLettersNotInWord = [...this.guessedLetters]
      .filter((letter) => !this.word.includes(letter))
      .length

    return this.totalLives - guessedLettersNotInWord
  }

  get wordProgress() {
    return [...this.word]
      .map((letter) => (this.guessedLetters.has(letter) ? letter : "\\_"))
      .join(" ")
  }

  get hasWon() {
    return [...this.word].every(letter => this.guessedLetters.has(letter))
  }

  guess(letter: string) {
    this.guessedLetters.add(letter.toLowerCase())
  }
}
