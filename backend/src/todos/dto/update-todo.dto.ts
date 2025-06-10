import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TodoStatus } from '../entities/todo.entity';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;
}

