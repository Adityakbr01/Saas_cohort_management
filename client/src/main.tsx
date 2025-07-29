import { SidebarProvider } from "@/components/ui/sidebar"
import { store } from '@/store/store.ts'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { ThemeProvider } from './components/Theme/theme-provider.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" >
      <Provider store={store}>
        <SidebarProvider>
          <App /> 
          <Toaster />
        </SidebarProvider>
      </Provider>
    </ThemeProvider>
)

