import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
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
  const { withLogin } = useAuth();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: savedViewsKey });

  const create = useMutation({
    mutationFn: (request: SaveSavedViewRequest) =>
      withLogin("save this view", () => createSavedView(request)),
    onSuccess,
  });
  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: SaveSavedViewRequest }) =>
      withLogin("update this view", () => updateSavedView(id, request)),
    onSuccess,
  });
  const remove = useMutation({
    mutationFn: (id: string) => withLogin("delete this view", () => deleteSavedView(id)),
    onSuccess,
  });

  return { create, update, remove };
}
