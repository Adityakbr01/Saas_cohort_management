import RoutingLayout from "@/layouts/RoutingLayout";
import useSessionWatcher from "./auth/useSessionWatcher";
import AppInitializer from "./components/AppInitializer";

function App() {
  // Initialize authentication state from localStorage first
  AppInitializer();

  // Then start session watcher (it will check auth state before running)
  useSessionWatcher();

  return <RoutingLayout />;
}

export default App;
