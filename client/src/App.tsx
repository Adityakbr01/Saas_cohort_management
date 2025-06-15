import RoutingLayout from "@/layouts/RoutingLayout";
import useSessionWatcher from "./auth/useSessionWatcher";
import AppInitializer from "./components/AppInitializer";

function App() {
   useSessionWatcher();
   AppInitializer()
  return <RoutingLayout />;
}

export default App;
