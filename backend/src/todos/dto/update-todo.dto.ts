import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateTodoDto } from './create-todo.dto';
import { TodoStatus } from '../entities/todo.entity';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiProperty({
    example: TodoStatus.DONE,
    description: 'The status of the todo',
    enum: TodoStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;
}


