import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from '@/store/store.ts'
import { ThemeProvider } from './components/Theme/theme-provider.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import { SidebarProvider } from "@/components/ui/sidebar"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" >
      <Provider store={store}>
        <SidebarProvider>
          <App /> 
          <Toaster />
        </SidebarProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>
)

