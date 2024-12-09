type Listener = (...args: unknown[]) => void;

export class EventEmitter {
	private events = new Map<string, Set<Listener>>();

	on(event: string, listener: Listener): void {
		if (!this.events.has(event)) {
			this.events.set(event, new Set());
		}
		this.events.get(event)?.add(listener);
	}

	once(event: string, listener: Listener): void {
		const wrapper = (...args: unknown[]) => {
			listener(...args);
			this.off(event, wrapper);
		};
		this.on(event, wrapper);
	}

	off(event: string, listener: Listener): void {
		this.events.get(event)?.delete(listener);
	}

	emit(event: string, ...args: unknown[]): void {
		for (const listener of this.events.get(event) ?? []) {
			listener(...args);
		}
	}

	removeAllListeners(event?: string): void {
		if (event) {
			this.events.delete(event);
		} else {
			this.events.clear();
		}
	}
}

export const eventEmitter = new EventEmitter();
