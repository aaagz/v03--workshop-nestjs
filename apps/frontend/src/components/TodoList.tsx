import { useTodos } from '../hooks/useTodos';
import TodoItem from './TodoItem.tsx';

const TodoList = () => {
  const { data: todos, isLoading, isError, error } = useTodos();

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <ul className="list-disc pl-5">
      {todos?.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
};

export default TodoList;
