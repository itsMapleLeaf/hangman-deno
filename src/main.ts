import * as log from "https://deno.land/std/log/mod.ts"
import { Coward, Message, Options } from "../deps/coward.ts"
import { config } from "../deps/dotenv.ts"
import { HangmanGame } from "./hangman-game.ts"
import { createMessageQueue } from "./message-queue.ts"
import { words } from "./words.ts"

const env = config()
const client = new Coward(env.DISCORD_TOKEN)
const queue = createMessageQueue(client)

const games = new Map<string, HangmanGame>() // channel id -> game

client.on("ready", () => {
  log.info("Ready")

  client.modifyPresence({
    game: {
      name: '.hangman',
      type: 2 // "listening to"
    },
    status: 'online'
  })
    .then(() => log.info("Status updated"))
    .catch((error) => log.error("Could not update status", error))
})

client.on("messageCreate", (message: Message) => {
  function reply(key: string, msg: string | Options.postMessage) {
    queue.sendMessage({ key, channelId: message.channel.id, content: msg })
  }

  function replyMention(key: string, msg: string) {
    reply(`${key}-${message.author.id}`, `<@${message.author.id}> ${msg}`)
  }

  function showPostGuessResult(game: HangmanGame) {
    if (game.remainingLives < 1) {
      replyMention('loser', `sorry, you lost :( the word was ${game.word}`)
      games.delete(message.channel.id)
      return
    }

    if (game.hasWon) {
      replyMention('winner', `you win! the word was ${game.word}`)
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

    reply('game-progress', {
      embed: {
        fields: embedFields
      },
    })
  }

  const content = message.content.trim()

  if (content === '.hangman') {
    if (!games.has(message.channel.id)) {
      const word = words[Math.floor(Math.random() * words.length)]
      const game = new HangmanGame(word, 10)
      games.set(message.channel.id, game)
      replyMention('new-game', "new game! type a single letter to guess")
      showPostGuessResult(game)
    } else {
      replyMention('game-running', "game already running! type a single letter to guess")
    }
  }

  const game = games.get(message.channel.id)
  if (game && /^[a-z]$/i.test(content)) {
    if (game.guessedLetters.has(content)) {
      replyMention('already-guessed', "that letter was already guessed!")
      return
    }

    game.guess(content)
    showPostGuessResult(game)
  }
})

client.on('error', (error: any) => {
  log.error('an error occurred', error)
})

client.connect()
