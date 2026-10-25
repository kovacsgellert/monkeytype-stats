import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGoal, deleteGoal, fetchGoals, updateGoal, type SaveGoalRequest } from "../api/goals";
import { withApiKey } from "../api/apiClient";

const goalsKey = ["goals"];

export function useGoals() {
  return useQuery({ queryKey: goalsKey, queryFn: fetchGoals, staleTime: 1000 * 60 * 5 });
}

export function useGoalMutations() {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: goalsKey });

  const create = useMutation({
    mutationFn: (request: SaveGoalRequest) =>
      withApiKey("create this goal", (key) => createGoal(request, key)),
    onSuccess,
  });
  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: SaveGoalRequest }) =>
      withApiKey("update this goal", (key) => updateGoal(id, request, key)),
    onSuccess,
  });
  const remove = useMutation({
    mutationFn: (id: string) => withApiKey("delete this goal", (key) => deleteGoal(id, key)),
    onSuccess,
  });

  return { create, update, remove };
}
