import { logger } from "@/shared/utils/logger";

type EventHandler = (payload: any, context?: any) => Promise<void> | void;

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Subscribe to an event
   * @param event The event name (e.g. 'user.created')
   * @param handler The callback function
   */
  subscribe(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)?.push(handler);
    logger.debug(`Subscribed to event: ${event}`);
  }

  /**
   * Publish an event to all subscribers
   * @param event The event name
   * @param payload The data payload
   * @param context Optional context (e.g. tenantId)
   */
  async publish(event: string, payload: any, context?: any): Promise<void> {
    const eventHandlers = this.handlers.get(event) || [];
    
    logger.debug(`Publishing event: ${event}`, { subscribers: eventHandlers.length, payload, context });

    // Execute handlers concurrently but safely catch errors
    await Promise.allSettled(
      eventHandlers.map(async (handler) => {
        try {
          await handler(payload, context);
        } catch (error) {
          logger.error(`Error in event handler for ${event}`, error, { payload, context });
        }
      })
    );
  }
}

// Singleton event bus for platform-wide events
export const platformEventBus = new EventBus();
