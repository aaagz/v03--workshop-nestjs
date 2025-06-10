import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TodosService } from './todos.service';
import { Todo, TodoStatus } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

// Mock TypeORM repository
const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});

describe('TodosService', () => {
  let service: TodosService;
  let repository: Repository<Todo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repository = module.get<Repository<Todo>>(getRepositoryToken(Todo));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new todo', async () => {
      const createTodoDto: CreateTodoDto = { title: 'Test Todo', description: 'Test Description' };
      const todo = { id: 'some-uuid', status: TodoStatus.OPEN, ...createTodoDto };

      (repository.create as jest.Mock).mockReturnValue(todo);
      (repository.save as jest.Mock).mockResolvedValue(todo);

      const result = await service.create(createTodoDto);
      expect(repository.create).toHaveBeenCalledWith(createTodoDto);
      expect(repository.save).toHaveBeenCalledWith(todo);
      expect(result).toEqual(todo);
    });
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      const todos = [{ id: '1', title: 'Test', description: 'Desc', status: TodoStatus.OPEN }];
      (repository.find as jest.Mock).mockResolvedValue(todos);

      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(todos);
    });
  });

  describe('findOne', () => {
    it('should return a single todo if found', async () => {
      const todo = { id: '1', title: 'Test', description: 'Desc', status: TodoStatus.OPEN };
      (repository.findOneBy as jest.Mock).mockResolvedValue(todo);

      const result = await service.findOne('1');
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual(todo);
    });

    it('should throw NotFoundException if todo is not found', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the todo', async () => {
      const updateTodoDto = { title: 'Updated Title' } as UpdateTodoDto;
      const existingTodo = { id: '1', title: 'Old Title', description: 'Desc', status: TodoStatus.OPEN };
      const updatedTodo = { ...existingTodo, ...updateTodoDto };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingTodo);
      (repository.save as jest.Mock).mockResolvedValue(updatedTodo);

      const result = await service.update('1', updateTodoDto);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated Title' }));
      expect(result).toEqual(updatedTodo);
    });
  });

  describe('remove', () => {
    it('should remove a todo successfully', async () => {
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      await service.remove('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if todo to remove is not found', async () => {
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});

