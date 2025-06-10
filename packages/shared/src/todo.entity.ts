import { z } from 'zod';

// The enum remains a simple, shared data structure.
export enum TodoStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

// The Zod schema defines the runtime shape of a Todo.
// This is now the single source of truth.
export const TodoSchema = z.object({
  id: z.string().uuid('Invalid UUID'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.nativeEnum(TodoStatus),
});

// The TypeScript type is inferred from the Zod schema.
export type Todo = z.infer<typeof TodoSchema>;
