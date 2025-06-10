import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({ status: 201, description: 'The todo has been successfully created.', type: Todo })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all todos' })
  @ApiResponse({ status: 200, description: 'A list of all todos.', type: [Todo] })
  findAll() {
    return this.todosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single todo by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the todo to retrieve', type: 'string' })
  @ApiResponse({ status: 200, description: 'The requested todo.', type: Todo })
  @ApiResponse({ status: 404, description: 'Todo not found.' })
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the todo to update', type: 'string' })
  @ApiResponse({ status: 200, description: 'The updated todo.', type: Todo })
  @ApiResponse({ status: 404, description: 'Todo not found.' })
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the todo to delete', type: 'string' })
  @ApiResponse({ status: 200, description: 'The todo has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Todo not found.' })
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}

