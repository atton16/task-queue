export interface Job {
  task: () => Promise<any>;
  retry?: number;
}
