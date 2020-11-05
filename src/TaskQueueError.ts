export class TaskQueueError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = 'TaskQueueError';
    this.code = code;
  }
}