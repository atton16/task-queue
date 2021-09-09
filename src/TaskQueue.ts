import { Job } from './Job';
import { TaskQueueConstructorOptions } from './TaskQueueConstructorOptions';
import { TaskQueueError } from './TaskQueueError';

export class TaskQueue {
  private opt: TaskQueueConstructorOptions = {
    concurrent: 1000,
    delay: 10,
  };
  started = false;
  private queue: Job[] = [];
  private running = 0;

  constructor(opt?: TaskQueueConstructorOptions) {
    if (opt !== undefined) {
      this.opt = opt;
    }
    if (!this.opt.delay) {
      this.opt.delay = 10;
    }
  }

  push(job: Job): void {
    this.queue.push(job);
  }

  length(): number {
    return this.queue.length;
  }

  async start(): Promise<void> {
    if (this.started) {
      throw new TaskQueueError('start is called while TaskQueue is running.', 1);
    }
    this.started = true;
    const loop = () => {
      this.process();
      if (this.started) {
        setTimeout(() => loop(), this.opt.delay);
      }
    };
    loop();
  }

  shutdown(): void {
    if (!this.started) {
      throw new TaskQueueError('shutdown is called while TaskQueue is already stopped.', 2);
    }

    this.started = false;
  }

  delay(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  process(): void {
    for (let i = 0; i < this.opt.concurrent; i++) {
      if (!this.queue.length || this.running >= this.opt.concurrent) {
        break;
      }
      const job = this.queue.shift();
      this.running++;
      job.task().then(() => {
        this.running--;
      }).catch(() => {
        this.running--;
        if (typeof job.retry === 'number') {
          const retry = job.retry >= 0 ? job.retry : 0;
          setTimeout(() => this.push(job), retry);
        }
      });
    }
  }
}
