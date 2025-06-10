import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Create a client
const queryClient = new QueryClient();

import AddTodoForm from './components/AddTodoForm';
import TodoList from './components/TodoList';

// The main page of our application
const HomePage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-4xl font-bold text-center mb-8">Todo App</h1>
    <AddTodoForm />
    <TodoList />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
