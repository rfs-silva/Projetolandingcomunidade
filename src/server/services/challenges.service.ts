import 'server-only'
import { challengesRepository } from '@/server/repositories/challenges.repository'
import { challengeSchema, type ChallengeDto } from '@/server/schemas/challenge.schema'
import { NotFoundError } from '@/server/http/errors'

export const challengesService = {
  async list(): Promise<ChallengeDto[]> {
    const rows = await challengesRepository.list()
    return rows.map((c) => challengeSchema.parse(c))
  },

  async getByNumber(num: string): Promise<ChallengeDto> {
    const challenge = await challengesRepository.findByNumber(num)
    if (!challenge) throw new NotFoundError('Desafio')
    return challengeSchema.parse(challenge)
  },
}
