import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { withContainer } from "../../config/ioc/with-container";
import { TodoContainerToken } from "./todo-container-token";
import { ITodoStore } from "./todo-store";
import { useInjection } from "../../config";

interface TodoDetailsPageProps {
  todoStore: ITodoStore;
}

const TodoDetailsPageComponent = observer(() => {
  const todoStore = useInjection<ITodoStore>(TodoContainerToken.TodoStore);
  const { id } = useParams<{ id: string }>();

  console.log(todoStore.currentTodo);

  useEffect(() => {
    if (id) {
      todoStore.fetchTodoById(Number(id));
    }
    
    return () => {
      todoStore.clearCurrentTodo();
    };
  }, [id, todoStore]);

  if (!todoStore.currentTodo) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Задача #{todoStore.currentTodo.id}</h2>
      <div style={{ 
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginTop: '1rem'
      }}>
        <h3>{todoStore.currentTodo.title}</h3>
        <p>
          Статус: {todoStore.currentTodo.completed ? 'Выполнено' : 'В процессе'}
        </p>
      </div>
    </div>
  );
});

export const TodoDetailsPage = withContainer(TodoDetailsPageComponent, {
  todoStore: TodoContainerToken.TodoStore
}); 