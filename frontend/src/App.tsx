import ChatWidget from './components/ChatWidget';
import { AppProviders } from './app/providers';
import { RouterProvider } from 'react-router/dom';
import { router } from './app/router';

/**
 * Main Application Component with Providers, Routing & AI Chat Widget
 */
export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <ChatWidget />
    </AppProviders>
  );
}
