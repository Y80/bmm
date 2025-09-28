import * as z from 'zod'
import { zhCN } from 'zod/locales'

z.config(zhCN())

export { z }

export { zodSchemas } from './schemas'
