import { defineConfig, devices } from "@playwright/test"
import dotenv from "dotenv"
import path from "path"

// Load .env.local for DB verification helpers
dotenv.config({ path: path.resolve(__dirname, ".env.local") })

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // nurse workflow tests are serial
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    navigationTimeout: 15_000,
    actionTimeout: 10_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
})
