import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todosRepository.create(createTodoDto);
    return this.todosRepository.save(todo);
  }

  async findAll(): Promise<Todo[]> {
    return this.todosRepository.find();
  }

  async findOne(id: string): Promise<Todo> {
    const found = await this.todosRepository.findOneBy({ id });
    if (!found) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
    return found;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);
    const updatedTodo = Object.assign(todo, updateTodoDto);
    return this.todosRepository.save(updatedTodo);
  }

  async remove(id: string): Promise<void> {
    const result = await this.todosRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
  }
}

