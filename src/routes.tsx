import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UnhabitForm } from './pages/UnhabitForm';
import { UnhabitDetails } from './pages/UnhabitDetails';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const newUnhabitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new',
  component: UnhabitForm,
});

const unhabitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unhabit/$unhabitId',
  component: UnhabitDetails,
});

const routeTree = rootRoute.addChildren([indexRoute, newUnhabitRoute, unhabitRoute]);

export const router = createRouter({ routeTree });