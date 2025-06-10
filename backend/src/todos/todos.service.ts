import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo, TodoStatus } from './entities/todo.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TodosService {
  private todos: Todo[] = [];

  create(createTodoDto: CreateTodoDto): Todo {
    const { title, description } = createTodoDto;
    const todo: Todo = {
      id: uuid(),
      title,
      description,
      status: TodoStatus.OPEN,
    };
    this.todos.push(todo);
    return todo;
  }

  findAll(): Todo[] {
    return this.todos;
  }

  findOne(id: string): Todo {
    const found = this.todos.find((todo) => todo.id === id);
    if (!found) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
    return found;
  }

  update(id: string, updateTodoDto: UpdateTodoDto): Todo {
    const todo = this.findOne(id);
    Object.assign(todo, updateTodoDto);
    return todo;
  }

  remove(id: string): void {
    const found = this.findOne(id);
    this.todos = this.todos.filter((todo) => todo.id !== found.id);
  }
}
