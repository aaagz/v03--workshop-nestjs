import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TodoStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity()
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TodoStatus,
    default: TodoStatus.OPEN,
  })
  status: TodoStatus;
}

