import RoutingLayout from "@/layouts/RoutingLayout";
import useSessionWatcher from "./auth/useSessionWatcher";
import AppInitializer from "./components/AppInitializer/index";

function App() {
  AppInitializer();
  useSessionWatcher();

  return <RoutingLayout />;
}

export default App;
