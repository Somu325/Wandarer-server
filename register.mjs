// ESM loader registration for ts-node — imported via --import flag in dev script
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('ts-node/esm', pathToFileURL('./'))
