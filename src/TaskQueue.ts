import { Job } from './Job';
import { TaskQueueConstructorOptions } from './TaskQueueConstructorOptions';
import { TaskQueueError } from './TaskQueueError';

export class TaskQueue {
  private opt: TaskQueueConstructorOptions = {
    concurrent: 1000,
  };
  started = false;
  private timeouts: NodeJS.Timeout[] = [];
  private queue: Job[] = [];

  constructor(opt?: TaskQueueConstructorOptions) {
    if (opt !== undefined) {
      this.opt = opt;
    }
  }

  push(job: Job): void {
    this.queue.push(job);
  }

  start(): void {
    if (this.started) {
      throw new TaskQueueError('start is called while TaskQueue is running.', 1);
    }
    this.started = true;
    for (let i = 0; i < this.opt.concurrent; i++) {
      this.timeouts.push(setInterval(this.process.bind(this), 0));
    }
  }

  shutdown(): void {
    if (!this.started) {
      throw new TaskQueueError('shutdown is called while TaskQueue is already stopped.', 2);
    }

    this.timeouts.forEach(t => {
      clearInterval(t);
    });
    this.timeouts = [];
    this.started = false;
  }

  process(): void {
    if (!this.queue.length) {
      return;
    }
    const job = this.queue.shift();
    job.task().catch(() => {
      if (typeof job.retry === 'number') {
        const retry = job.retry >= 0 ? job.retry : 0;
        setTimeout(() => this.push(job), retry);
      }
    });
  }
}
