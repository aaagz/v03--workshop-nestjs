import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ example: 'Buy milk', description: 'The title of the todo' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Go to the store and buy milk',
    description: 'The description of the todo',
    required: false,
  })
  @IsString()
  description: string;
}
