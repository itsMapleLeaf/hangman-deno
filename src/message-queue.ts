import { delay } from "https://deno.land/std/async/delay.ts"
import { Coward, Options } from "./coward.ts"

type QueuedMessage = {
  key: string
  channelId: string
  content: string | Options.postMessage
}

const queueDelay = 1000

export function createMessageQueue(client: Coward) {
  const messageQueue: Array<QueuedMessage> = []
  let running = false

  async function sendMessage(message: QueuedMessage) {
    if (messageQueue[messageQueue.length - 1]?.key === message.key) {
      messageQueue.pop()
    }
    messageQueue.push(message)
    run()
  }

  async function run() {
    if (running) return
    running = true

    while (true) {
      const entry = messageQueue.shift()
      if (entry) {
        client.postMessage(entry.channelId, entry.content)
      }
      await delay(queueDelay)
    }
  }

  return { sendMessage }
}
