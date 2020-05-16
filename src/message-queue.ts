import { delay } from "https://deno.land/std/async/delay.ts"
import { Coward, Options } from "../deps/coward.ts"

type QueuedMessage = {
  key: string
  channelId: string
  content: string | Options.postMessage
}

const queueDelay = 800

export function createMessageQueue(client: Coward) {
  const messageQueue: Array<QueuedMessage> = []
  let lastSentTime = Date.now()

  async function sendMessage(message: QueuedMessage) {
    if (messageQueue[messageQueue.length - 1]?.key === message.key) {
      messageQueue.pop()
    }
    messageQueue.push(message)

    // wait until it's been [queueDelay] ms before sending new messages
    await delay(Math.max((lastSentTime + queueDelay) - Date.now(), 0))

    for (const { channelId, content } of messageQueue) {
      client.postMessage(channelId, content)
    }
  }

  return { sendMessage }
}
