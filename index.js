const axios = require('axios')

const API_KEY = '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'
const GPT_API_URL = 'https://api.openai.com/v1/engines/davinci-codex/completions'

async function askGPT(question) {
  try {
    const response = await axios.post(GPT_API_URL, {
      prompt: question,
      max_tokens: 100,
      temperature: 0.7,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
      }
    })

    return response.data.choices[0].text.trim()
  } catch (error) {
    console.error('Error calling GPT API: ', error)
    throw error
  }
}

const question = 'What is the capital of France?'
askGPT(question)
  .then((answer) => {
    console.log('GPT AI Response: ', answer)
  })
  .catch((error) => {
    console.log('Error', error)
  })
