import 'server-only'
import { eventsRepository } from '@/server/repositories/events.repository'
import { eventSchema, type EventDto, type EventQuery } from '@/server/schemas/event.schema'
import { NotFoundError } from '@/server/http/errors'

export const eventsService = {
  async list(query: EventQuery): Promise<EventDto[]> {
    const rows = await eventsRepository.list({ type: query.type })
    return rows.map((e) => eventSchema.parse(e))
  },

  async getByNumber(num: string): Promise<EventDto> {
    const event = await eventsRepository.findByNumber(num)
    if (!event) throw new NotFoundError('Evento')
    return eventSchema.parse(event)
  },
}
