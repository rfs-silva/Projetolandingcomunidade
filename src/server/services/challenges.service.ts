import 'server-only'
import { challengesRepository } from '@/server/repositories/challenges.repository'
import { challengeSchema, type ChallengeDto } from '@/server/schemas/challenge.schema'
import { NotFoundError } from '@/server/http/errors'

export const challengesService = {
  async list(
    options: { includeMembers?: boolean } = {},
  ): Promise<ChallengeDto[]> {
    const rows = await challengesRepository.list(options)
    return rows.map((c) => challengeSchema.parse(c))
  },

  async getByNumber(
    num: string,
    options: { includeMembers?: boolean } = {},
  ): Promise<ChallengeDto> {
    const challenge = await challengesRepository.findByNumber(
      num,
      options.includeMembers,
    )
    if (!challenge) throw new NotFoundError('Desafio')
    return challengeSchema.parse(challenge)
  },
}
