import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todosRepository.create(createTodoDto);
    const saved = await this.todosRepository.save(todo);
    this.logger.log(`A todo has been created with ID: ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<Todo[]> {
    return this.todosRepository.find();
  }

  async findOne(id: string): Promise<Todo> {
    const found = await this.todosRepository.findOneBy({ id });
    if (!found) {
      this.logger.warn(`Todo with ID "${id}" not found`);
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
    return found;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);
    const updatedTodo = Object.assign(todo, updateTodoDto);
    const saved = await this.todosRepository.save(updatedTodo);
    this.logger.log(`Todo with ID "${id}" has been updated`);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const result = await this.todosRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Todo with ID "${id}" not found for removal`);
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
    this.logger.log(`Todo with ID "${id}" has been removed`);
  }
}


