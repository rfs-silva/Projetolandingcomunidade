import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  leadersFileSchema,
  type LeaderDto,
} from '@/server/schemas/leader.schema'

const FILE_PATH = path.join(process.cwd(), 'content', 'leaders.json')

export const leadersService = {
  async list(): Promise<LeaderDto[]> {
    const raw = await readFile(FILE_PATH, 'utf-8')
    const parsed = leadersFileSchema.parse(JSON.parse(raw))
    return parsed.leaders
  },
}
