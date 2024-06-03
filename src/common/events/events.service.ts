// src/event.service.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class EventService extends EventEmitter {
  constructor() {
    super();
  }

  // Add any custom methods if needed
  emitEvent(eventName: string, ...args: any[]) {
    this.emit(eventName, ...args);
  }

  onEvent(eventName: string, listener: (...args: any[]) => void) {
    this.on(eventName, listener);
  }
}
