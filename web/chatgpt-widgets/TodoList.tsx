import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetProps, useWidgetState } from "./utils/hooks";
import { UnknownObject } from "./utils/types";
import { api } from "../api";
import { useAction } from "@gadgetinc/react";

interface TodoState extends UnknownObject {
  todos: Todo[];
}

type Todo = {
  id: string;
  item: string;
  isComplete: boolean;
  createdAt: string;
};

const TodoListWidget = () => {
  // Use useWidgetState to manage the persistent todo state
  const [state, setState] = useWidgetState<TodoState>({
    todos: [],
  });

  const toolOutput: { todos: Todo[]; } = useWidgetProps();
  const [inputValue, setInputValue] = useState("");
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);

  // useAction hooks for creating and updating todos
  const [{ data: createData, fetching: isCreating, error: createError }, createTodo] = useAction(api.todo.create);
  const [{ data: updateData, fetching: isUpdating, error: updateError }, updateTodo] = useAction(api.todo.update);

  // Get todos from state, with fallback to empty array
  const todos = state?.todos ?? [];

  // useEffect to handle toolOutput (initial todolist state passed by structuredContent in tool call)
  useEffect(() => {
    // only use tooloutput if we don't have todos yet
    // some reconciliation logic between widgetState and toolOutput may be needed here in a real app
    if (toolOutput?.todos && todos.length === 0) {
      // Update state with todos from tool output
      setState((prevState) => ({
        ...prevState,
        todos: toolOutput.todos,
      }));
      setIsLoadingTodos(false);
    } else if (toolOutput != undefined) {
      // toolOutput is available but no todos, so we're done loading
      setIsLoadingTodos(false);
    }
  }, [toolOutput, setState, todos.length]);

  // useEffect to add created todo to widgetState
  useEffect(() => {
    if (createData && !createError) {
      setState((prevState) => {
        const currentTodos = prevState?.todos ?? [];
        return {
          ...prevState,
          todos: [...currentTodos, { id: createData.id, item: createData.item, isComplete: createData.isComplete, createdAt: createData.createdAt.toDateString() } as Todo],
        };
      });
      console.log("Todo added successfully:", createData);
    } else if (createError) {
      console.error("Failed to add todo:", createError);
    }
  }, [createData, createError]);

  // useEffect to updated completed todo in widgetState
  useEffect(() => {
    if (updateData && !updateError) {
      // Update the todo completion status
      setState((prevState) => {
        const index = prevState?.todos.findIndex(todo => todo.id === updateData.id);
        const updatedTodos = [...(prevState?.todos ?? [])];
        updatedTodos[index] = {
          ...updatedTodos[index],
          isComplete: true,
        };
        return {
          ...prevState,
          todos: updatedTodos,
        };
      });

      console.log("Todo completed successfully:", updateData);
    } else if (updateError) {
      console.error("Failed to complete todo:", updateError);
    }
  }, [updateData, updateError]);

  // Add a todo (form submission)
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    const item = inputValue.trim();
    if (!item) return;

    setInputValue("");

    // Use Gadget API client and useAction hook to create a new todo
    await createTodo({ item });
  };

  // Complete a todo (row click)
  const handleToggleComplete = async (index: number) => {
    if (!todos[index].isComplete) {
      // Use the Gadget API client and useAction hook to complete a todo
      await updateTodo({ id: todos[index].id, isComplete: true });
    }
  };

  return (
    <Card className="w-full text-gray-900">
      <CardContent className="p-6">
        {/* Add Form */}
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Add a new todo..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
            className="flex-1"
          />
          <Button
            type="submit"
            variant="outline"
            className="hover:bg-gray-200 active:scale-95 transition"
            disabled={isCreating}
          >
            {isCreating ? "Adding..." : "➕ Add"}
          </Button>
        </form>

        {/* Todo List */}
        <ul className="list-none p-0 m-0">
          {todos.length === 0 && isLoadingTodos && (
            <>
              {[...Array(4)].map((_, index) => (
                <li
                  key={`skeleton-${index}`}
                  className="flex justify-between items-center py-3 px-2 border-b border-gray-200"
                >
                  <Skeleton className="flex-1 h-5 mr-4" />
                  <Skeleton className="h-4 w-20" />
                </li>
              ))}
            </>
          )}

          {todos.map((todo, index) => (
            <li
              key={todo.id ?? index}
              className={`flex justify-between items-center py-3 px-2 border-b border-gray-200 hover:bg-gray-50 transition ${todo.isComplete ? "opacity-70" : ""
                }`}
            >
              <span
                onClick={() => handleToggleComplete(index)}
                className={`flex-1 text-base cursor-pointer ${todo.isComplete
                  ? "line-through text-gray-400"
                  : "text-gray-800"
                  }`}
              >
                {todo.item}
              </span>
              <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                {new Date(todo.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
          {isCreating && (
            <li className="flex justify-between items-center py-3 px-2 border-b border-gray-200">
              <Skeleton className="flex-1 h-5 mr-4" />
              <Skeleton className="h-4 w-20" />
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TodoListWidget;
