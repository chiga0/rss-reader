import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { router } from '@/lib/router/routes';

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
