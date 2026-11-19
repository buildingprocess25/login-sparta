import { createApp } from "./app"
import { loadEnv } from "./config/env"
import { PrismaProvisioningRepository } from "./modules/provisioning/provisioning.repository"
import { ProvisioningWorker } from "./modules/provisioning/provisioning.worker"

const env = loadEnv()
const app = createApp(env)

app.listen(env.PORT, () => {
  console.log(`SPARTA API listening on port ${env.PORT}`)
})

if (env.SPARTA_PROVISIONING_WORKER_ENABLED === "true") {
  const worker = new ProvisioningWorker(new PrismaProvisioningRepository(), {
    secrets: {
      building: env.SPARTA_PROVISIONING_SECRET_BUILDING,
      maintenance: env.SPARTA_PROVISIONING_SECRET_MAINTENANCE,
      energy: env.SPARTA_PROVISIONING_SECRET_ENERGY,
      siaga: env.SPARTA_PROVISIONING_SECRET_SIAGA,
      carbontrack: env.SPARTA_PROVISIONING_SECRET_CARBONTRACK,
    },
  })
  worker.start()
  console.log("SPARTA provisioning worker aktif")
}
