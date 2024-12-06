export abstract class AbstractLogger {
  abstract log(message: string): void;
}

export class ConsoleLogger implements AbstractLogger {
  log(message: string): void {
    console.log(`[LOG]: ${message}`);
  }
}
