import { Coward, Message, Options } from "../deps/coward.ts"
import { config } from "../deps/dotenv.ts"
import { HangmanGame } from "./hangman-game.ts"

const env = config()
const client = new Coward(env.DISCORD_TOKEN)

// channel id -> game
const games = new Map<string, HangmanGame>()

client.on("ready", () => {
  client.modifyPresence({
    game: {
      name: '.hangman',
      type: 2
    },
    status: 'online'
  })
    .then(() => console.info("Status updated"))
    .catch((error) => console.error("Could not update status", error))
})

client.on("messageCreate", (message: Message) => {
  function reply(msg: string | Options.postMessage) {
    client.postMessage(message.channel.id, msg)
  }

  function replyMention(msg: string) {
    client.postMessage(message.channel.id, `<@${message.author.id}> ${msg}`)
  }

  function showPostGuessResult(game: HangmanGame) {
    if (game.remainingLives < 1) {
      replyMention(`sorry, you lost :( the word was ${game.word}`)
      games.delete(message.channel.id)
      return
    }

    if (game.hasWon) {
      replyMention(`you win! the word was ${game.word}`)
      games.delete(message.channel.id)
      return
    }

    const embedFields = [
      { name: 'Word', value: game.wordProgress },
      { name: 'Lives Remaining', value: String(game.remainingLives) },
    ]

    if (game.guessedLetters.size > 0) {
      embedFields.push({
        name: 'Guessed Letters',
        value: [...game.guessedLetters].join(', '),
      })
    }

    reply({
      embed: {
        fields: embedFields
      },
    })
  }

  const content = message.content.trim()

  if (content === '.hangman') {
    if (!games.has(message.channel.id)) {
      const game = new HangmanGame('butts', 10)
      games.set(message.channel.id, game)
      replyMention("new game! use .hg to guess, e.g. `.hg e`")
      showPostGuessResult(game)
    } else {
      replyMention("game already running! use .hg to guess, e.g. `.hg e`")
    }
  }

  if (content.startsWith('.hg')) {
    const game = games.get(message.channel.id)
    if (!game) {
      replyMention("no game found! start a game with !hangman first")
      return
    }

    const parts = content.split(/\s+/)
    const guessedLetter = parts[1]
    if (!guessedLetter) {
      replyMention("guess a letter, e.g. `.hg e`")
      return
    }

    if (guessedLetter.length !== 1) {
      replyMention("single letters only!")
      return
    }

    if (game.guessedLetters.has(guessedLetter)) {
      replyMention("that letter was already guessed!")
      return
    }

    game.guess(guessedLetter)
    showPostGuessResult(game)
  }
})

client.connect()
