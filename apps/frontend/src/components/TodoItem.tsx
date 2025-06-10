import { TodoStatus, type Todo } from '@v03-workshop/shared';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';

interface TodoItemProps {
  todo: Todo;
}

const TodoItem = ({ todo }: TodoItemProps) => {
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  const handleToggle = () => {
    const newStatus = todo.status === TodoStatus.DONE ? TodoStatus.OPEN : TodoStatus.DONE;
    updateTodoMutation.mutate({ id: todo.id, data: { status: newStatus } });
  };

  const handleDelete = () => {
    deleteTodoMutation.mutate(todo.id);
  };

  return (
    <li className="flex items-center justify-between p-2 border-b">
      <span className={`${todo.status === TodoStatus.DONE ? 'line-through' : ''}`}>
        {todo.title}
      </span>
      <div>
        <input
          type="checkbox"
          checked={todo.status === TodoStatus.DONE}
          onChange={handleToggle}
          className="mr-2"
        />
        <button onClick={handleDelete} className="text-red-500">Delete</button>
      </div>
    </li>
  );
};

export default TodoItem;
