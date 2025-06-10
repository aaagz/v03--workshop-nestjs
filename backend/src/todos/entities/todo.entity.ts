export enum TodoStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class Todo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
}

