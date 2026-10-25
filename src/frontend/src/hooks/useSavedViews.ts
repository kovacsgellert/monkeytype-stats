import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { withApiKey } from "../api/apiClient";
import {
  createSavedView,
  deleteSavedView,
  fetchSavedViews,
  updateSavedView,
  type SaveSavedViewRequest,
} from "../api/savedViews";

const savedViewsKey = ["saved-views"];

export function useSavedViews() {
  return useQuery({ queryKey: savedViewsKey, queryFn: fetchSavedViews, staleTime: 1000 * 60 * 5 });
}

export function useSavedViewMutations() {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: savedViewsKey });

  const create = useMutation({
    mutationFn: (request: SaveSavedViewRequest) =>
      withApiKey("save this view", (key) => createSavedView(request, key)),
    onSuccess,
  });
  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: SaveSavedViewRequest }) =>
      withApiKey("update this view", (key) => updateSavedView(id, request, key)),
    onSuccess,
  });
  const remove = useMutation({
    mutationFn: (id: string) => withApiKey("delete this view", (key) => deleteSavedView(id, key)),
    onSuccess,
  });

  return { create, update, remove };
}
