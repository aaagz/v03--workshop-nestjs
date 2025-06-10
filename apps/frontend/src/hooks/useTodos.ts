import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api';
import type { Todo, CreateTodoDto, UpdateTodoDto } from '@v03-workshop/shared';

// Fetch all todos
const getTodos = async (): Promise<Todo[]> => {
  const response = await apiClient.get('/todos');
  return response.data;
};

export const useTodos = () => {
  return useQuery<Todo[], Error>({ queryKey: ['todos'], queryFn: getTodos });
};

// Create a new todo
const createTodo = async (newTodo: CreateTodoDto): Promise<Todo> => {
  const response = await apiClient.post('/todos', newTodo);
  return response.data;
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation<Todo, Error, CreateTodoDto>({ 
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

// Update a todo
const updateTodo = async (updatedTodo: { id: string; data: UpdateTodoDto }): Promise<Todo> => {
  const { id, data } = updatedTodo;
  const response = await apiClient.patch(`/todos/${id}`, data);
  return response.data;
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation<Todo, Error, { id: string; data: UpdateTodoDto }>({ 
    mutationFn: updateTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

// Delete a todo
const deleteTodo = async (id: string): Promise<void> => {
  await apiClient.delete(`/todos/${id}`);
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({ 
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
