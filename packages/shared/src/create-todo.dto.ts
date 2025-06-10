import { z } from 'zod';
import { TodoSchema } from './todo.entity';

// The schema for creating a new todo is derived from the base TodoSchema.
// We only need the 'title' and 'description' fields for creation.
export const CreateTodoSchema = TodoSchema.pick({
  title: true,
  description: true,
});

// The DTO type is inferred from the schema.
export type CreateTodoDto = z.infer<typeof CreateTodoSchema>;
