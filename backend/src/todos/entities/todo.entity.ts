import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TodoStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity()
export class Todo {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'The unique identifier of the todo' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Buy milk', description: 'The title of the todo' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Go to the store and buy milk', description: 'The description of the todo' })
  @Column()
  description: string;

  @ApiProperty({ example: TodoStatus.OPEN, description: 'The status of the todo', enum: TodoStatus })
  @Column({
    type: 'enum',
    enum: TodoStatus,
    default: TodoStatus.OPEN,
  })
  status: TodoStatus;
}


