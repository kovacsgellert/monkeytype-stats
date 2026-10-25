import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import App from "./App";
import { DashboardPage } from "./pages/DashboardPage";
import { ExplorerPage } from "./pages/ExplorerPage";
import { GoalsPage } from "./pages/GoalsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { dimensions, type Dimension } from "./stats/dimensions";
import { sanitizeFilter, type ResultFilter } from "./stats/filter";

export type ExplorerMetric = "wpm" | "acc" | "consistency" | "rawWpm";
export type ExplorerXAxis = "date" | "test" | "hours";

/** Explorer state lives in the URL so insight cards can deep-link and reloads keep it. */
export interface ExplorerSearch extends ResultFilter {
  metric?: ExplorerMetric;
  x?: ExplorerXAxis;
  group?: Dimension;
  /** Comma-separated rolling windows ("10,100"), "none" for none; missing = defaults. */
  avg?: string;
  pb?: boolean;
  trend?: boolean;
}

function oneOf<T extends string>(value: unknown, options: readonly T[]): T | undefined {
  return options.includes(value as T) ? (value as T) : undefined;
}

export function validateExplorerSearch(search: Record<string, unknown>): ExplorerSearch {
  const result: ExplorerSearch = {
    ...sanitizeFilter(search),
    metric: oneOf(search.metric, ["wpm", "acc", "consistency", "rawWpm"] as const),
    x: oneOf(search.x, ["date", "test", "hours"] as const),
    group: oneOf(search.group, dimensions.map((d) => d.key)),
    avg: typeof search.avg === "string" || typeof search.avg === "number" ? String(search.avg) : undefined,
    pb: search.pb === false || search.pb === "false" ? false : undefined,
    trend: search.trend === true || search.trend === "true" ? true : undefined,
  };
  return Object.fromEntries(
    Object.entries(result).filter(([, v]) => v !== undefined),
  ) as ExplorerSearch;
}

const rootRoute = createRootRoute({ component: App });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const explorerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "explorer",
  validateSearch: validateExplorerSearch,
  component: ExplorerPage,
});

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "goals",
  component: GoalsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  explorerRoute,
  goalsRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree, scrollRestoration: true });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
