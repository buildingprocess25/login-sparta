import { createApp } from "./app"
import { loadEnv } from "./config/env"

const env = loadEnv()
const app = createApp(env)

app.listen(env.PORT, () => {
  console.log(`SPARTA API listening on port ${env.PORT}`)
})
