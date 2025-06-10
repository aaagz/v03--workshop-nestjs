import { Todo, TodoStatus } from '@v03-workshop/shared';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// This class defines the database schema for a Todo.
// It implements the shared Todo type to ensure consistency.
@Entity({ name: 'todos' })
export class TodoEntity implements Todo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({
    type: 'enum',
    enum: TodoStatus,
    default: TodoStatus.OPEN,
  })
  status!: TodoStatus;
}
