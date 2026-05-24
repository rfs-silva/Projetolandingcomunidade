import 'server-only'
import { eventsRepository } from '@/server/repositories/events.repository'
import { eventSchema, type EventDto, type EventQuery } from '@/server/schemas/event.schema'
import { NotFoundError } from '@/server/http/errors'

export const eventsService = {
  async list(
    query: EventQuery,
    options: { includeMembers?: boolean } = {},
  ): Promise<EventDto[]> {
    const rows = await eventsRepository.list({
      type: query.type,
      includeMembers: options.includeMembers,
    })
    return rows.map((e) => eventSchema.parse(e))
  },

  async getByNumber(
    num: string,
    options: { includeMembers?: boolean } = {},
  ): Promise<EventDto> {
    const event = await eventsRepository.findByNumber(num, options.includeMembers)
    if (!event) throw new NotFoundError('Evento')
    return eventSchema.parse(event)
  },
}
