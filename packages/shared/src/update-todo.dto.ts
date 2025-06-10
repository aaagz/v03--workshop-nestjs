import { z } from 'zod';
import { TodoSchema } from './todo.entity';

// The schema for updating a todo allows for partial updates.
// We take the fields that can be updated and make them all optional.
export const UpdateTodoSchema = TodoSchema.pick({
  title: true,
  description: true,
  status: true,
}).partial();

// The DTO type is inferred from the schema.
export type UpdateTodoDto = z.infer<typeof UpdateTodoSchema>;
