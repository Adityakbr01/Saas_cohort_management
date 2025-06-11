import RoutingLayout from "@/layouts/RoutingLayout";
import useSessionWatcher from "./auth/useSessionWatcher";

function App() {
   useSessionWatcher();
  return <RoutingLayout />;
}

export default App;
