import { join } from 'path'
import { cwd } from 'process'
import { config as dotenvConfig } from 'dotenv'

type Envs = {
  ORG_ID: string
  TOKEN: string
}

export default dotenvConfig({ path: join(cwd(), '.env'), processEnv: {} }).parsed as Envs
