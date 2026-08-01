import { setupWorker } from 'msw/browser'
import { auctionHandlers, betHandlers } from '@/shared/mocks/handlers/index'

export const worker = setupWorker(...auctionHandlers, ...betHandlers)
