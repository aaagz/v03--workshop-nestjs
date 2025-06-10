import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoEntity } from './../src/todos/entities/todo.entity';

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<TodoEntity>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    repository = moduleFixture.get<Repository<TodoEntity>>(
      getRepositoryToken(TodoEntity),
    );
  });

  beforeEach(async () => {
    // Clear the table before each test
    await repository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/todos (POST) - should create a new todo', () => {
    return request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'e2e-test', description: 'e2e-description' })
      .expect(201)
      .then((res) => {
        expect(res.body).toEqual({
          id: expect.any(String),
          title: 'e2e-test',
          description: 'e2e-description',
          status: 'OPEN',
        });
      });
  });

  it('/todos (GET) - should return an array of todos', async () => {
    await repository.save({ title: 'test-1', description: 'desc-1' });
    await repository.save({ title: 'test-2', description: 'desc-2' });

    return request(app.getHttpServer())
      .get('/todos')
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveLength(2);
        expect(res.body[0].title).toBe('test-1');
      });
  });

  it('/todos/:id (GET) - should return a single todo', async () => {
    const todo = await repository.save({
      title: 'test-get-one',
      description: 'desc-get-one',
    });

    return request(app.getHttpServer())
      .get(`/todos/${todo.id}`)
      .expect(200)
      .then((res) => {
        expect(res.body.title).toBe('test-get-one');
      });
  });

  it('/todos/:id (PATCH) - should update a todo', async () => {
    const todo = await repository.save({
      title: 'test-patch',
      description: 'desc-patch',
    });

    return request(app.getHttpServer())
      .patch(`/todos/${todo.id}`)
      .send({ title: 'updated-title' })
      .expect(200)
      .then((res) => {
        expect(res.body.title).toBe('updated-title');
      });
  });

  it('/todos/:id (DELETE) - should delete a todo', async () => {
    const todo = await repository.save({
      title: 'test-delete',
      description: 'desc-delete',
    });

    await request(app.getHttpServer()).delete(`/todos/${todo.id}`).expect(200);

    const found = await repository.findOneBy({ id: todo.id });
    expect(found).toBeNull();
  });
});
