import type { ResultFilter } from "../stats/filter";
import { apiRequest } from "./apiClient";

export interface SavedView {
  id: string;
  name: string;
  filter: ResultFilter;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSavedViewRequest {
  name: string;
  filter: ResultFilter;
  sortOrder?: number;
}

export function fetchSavedViews(): Promise<SavedView[]> {
  return apiRequest<SavedView[]>("api/saved-views");
}

export function createSavedView(request: SaveSavedViewRequest, apiKey: string) {
  return apiRequest<SavedView>("api/saved-views", { method: "POST", body: request, apiKey });
}

export function updateSavedView(id: string, request: SaveSavedViewRequest, apiKey: string) {
  return apiRequest<SavedView>(`api/saved-views/${id}`, { method: "PUT", body: request, apiKey });
}

export function deleteSavedView(id: string, apiKey: string) {
  return apiRequest<null>(`api/saved-views/${id}`, { method: "DELETE", apiKey });
}
