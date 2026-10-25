import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { createGoal, deleteGoal, fetchGoals, updateGoal, type SaveGoalRequest } from "../api/goals";

const goalsKey = ["goals"];

export function useGoals() {
  return useQuery({ queryKey: goalsKey, queryFn: fetchGoals, staleTime: 1000 * 60 * 5 });
}

export function useGoalMutations() {
  const queryClient = useQueryClient();
  const { withLogin } = useAuth();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: goalsKey });

  const create = useMutation({
    mutationFn: (request: SaveGoalRequest) =>
      withLogin("create this goal", () => createGoal(request)),
    onSuccess,
  });
  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: SaveGoalRequest }) =>
      withLogin("update this goal", () => updateGoal(id, request)),
    onSuccess,
  });
  const remove = useMutation({
    mutationFn: (id: string) => withLogin("delete this goal", () => deleteGoal(id)),
    onSuccess,
  });

  return { create, update, remove };
}
