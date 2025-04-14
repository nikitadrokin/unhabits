import {
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import { UnhabitForm } from './pages/UnhabitForm';
import { UnhabitDetails } from './pages/UnhabitDetails';
import ArchivedUnhabits from './pages/ArchivedUnhabits';

import appCss from '@/index.css?url';

const rootRoute = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Unhabits',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
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

const archivedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/archived',
  component: ArchivedUnhabits,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  newUnhabitRoute,
  unhabitRoute,
  archivedRoute,
]);

export const router = createRouter({ routeTree });
