import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useInjection } from "~/config";
import { withContainer } from "~/config";
import { TodoContainerToken } from "./todo-container-token.ts";
import type { ITodoStore } from "./todo-store.ts";


const TodoPageComponent = observer(() => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const todoStore = useInjection<ITodoStore>(TodoContainerToken.TodoStore);

  const [newTodo, setNewTodo] = useState("");
  const [validate, setValidate] = useState("");

  useEffect(() => {
    return () => {
      todoStore.cleanup();
    };
  }, [todoStore]);

  const addTodo = () => {
    if (newTodo) {
      todoStore.addTodo(newTodo);
      setNewTodo("");
      setValidate("")
    } else {
      setValidate("Please enter a todo");
    }
  };

  const startEditing = (index: number, todo: string) => {
    setEditingIndex(index);
    setEditingText(todo);
  };

  const saveEdit = (index: number) => {
    if (editingText.trim()) {
      todoStore.updateTodo(index, editingText);
      setEditingIndex(null);
      setEditingText("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const renderTodoItem = (todo: string, index: number) => {
    if (editingIndex === index) {
      return (
        <li key={index} style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            style={{
              padding: '0.3rem',
              borderRadius: '4px',
              border: '1px solid #646cff'
            }}
          />
          <button
            type="button"
            onClick={() => saveEdit(index)}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '0.3rem 0.8rem',
              borderRadius: '4px'
            }}
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '0.3rem 0.8rem',
              borderRadius: '4px'
            }}
          >
            Отмена
          </button>
        </li>
      );
    }

    return (
      <li key={index} style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        <input
          type="text"
          value={todo}
          onChange={(e) => todoStore.updateTodo(index, e.target.value)}
          style={{
            padding: '0.3rem',
            borderRadius: '4px',
            border: '1px solid #646cff'
          }}
        />
        <button
          type="button"
          onClick={() => startEditing(index, todo)}
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '0.3rem 0.8rem',
            borderRadius: '4px'
          }}
        >
          Изменить
        </button>
        <button
          type="button"
          onClick={() => todoStore.deleteTodo(index)}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            padding: '0.3rem 0.8rem',
            borderRadius: '4px'
          }}
        >
          Удалить
        </button>
      </li>
    );
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Список задач</h2>
      <div style={{ marginBottom: '2rem' }}>
        {todoStore.todoList.map((todo, index) => (
          <div key={index} style={{
            padding: '0.5rem',
            borderBottom: '1px solid #eee'
          }}>
            <Link to={`/todo/${index + 1}`} style={{
              color: '#646cff',
              textDecoration: 'none'
            }}>
              {todo}
            </Link>
          </div>
        ))}
      </div>
    
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Введите новую задачу"
          style={{
            padding: '0.3rem',
            borderRadius: '4px',
            border: '1px solid #646cff'
          }}
        />
        <button type="button" onClick={addTodo}>Добавить</button>
      </div>
      {validate && <p style={{ color: 'red' }}>{validate}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todoStore.todos.map((todo, index) => renderTodoItem(todo, index))}
      </ul>
    </div>
  );
});

export const TodoPage = withContainer(TodoPageComponent, {
  todoStore: TodoContainerToken.TodoStore,
  analyticsService: TodoContainerToken.AnalyticsTodoService,
});

