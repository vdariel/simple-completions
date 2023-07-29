import axios from 'axios'
import redis from 'redis'
import dotenv from 'dotenv'

dotenv.config()

const API_KEY = process.env.API_KEY
const GPT_API_URL = process.env.GPT_API_URL

async function askGPT(messages) {
  const response = await axios.post(GPT_API_URL, {
    messages: messages,
    model: 'gpt-3.5-turbo',
    max_tokens: 100,
    temperature: 0.7,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY,
    }
  })

  return response.data.choices[0];
}

async function askGPTUntilComplete(question) {
  const messages = [
    { role: 'user', content: question }
  ]

  let response = { finish_reason: 'stop' }

  do {
    response = await askGPT(messages)
    console.log(response.message.content);
    messages.push(response.message)
  } while (response.finish_reason !== 'stop')
}

const client = redis.createClient({
  url: 'redis://localhost:6379'
})

client.connect().then(async (data) => {
  const lastTime = await client.get('last_time');
  const executeChatGPT = () => {
    askGPTUntilComplete('Between Sequalize, Prisma and Typeorm which one is the best orm for nodeJs?').then(() => {
      client.set('last_time', new Date().getTime())
      client.quit()
    })
  }

  if (!lastTime) {
    executeChatGPT()
  } else {
    const now = new Date().getTime()
    const savedDate = new Date()
    savedDate.setTime(lastTime)

    if (now - savedDate.getTime() < 25000) {
      console.log('You just can make 3 request per minute to ChatGPT API')
      client.quit()
      return
    }

    executeChatGPT()
  }
}).catch(error => console.log(error))