# @atton16/task-queue

A Node.JS task queue implementation with concurrency support.

## Installation

```bash
npm install @atton16/task-queue
```

## Usage

```typescript
import process from 'process';
import cluster from 'cluster';
import { TaskQueue } from '@atton16/task-queue';

const config = {
  workerN: 3,
  taskN: 1000,
};

if (cluster.isMaster) {
  for (let i = 0; i < config.workerN; i++) {
    cluster.fork({id: i});
  }
} else {
  const queue = new TaskQueue({concurrent: config.taskN});
  
  queue.start();

  function generateTasks(round, count) {
    for(let i = 0; i < count; i++) {
      queue.push({
        task: () => new Promise((resolve) => {
          console.log(`${process.env.id}.${round}.${i}`);
          resolve();
        }),
      });
    }
  }

  let round = 0;
  generateTasks(++round, 10000);
  setInterval(() => {
    generateTasks(++round, 10000);
  }, 10000);
}
```

## License

ISC License

Copyright (c) 2020, Attawit Kittikrairit

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
