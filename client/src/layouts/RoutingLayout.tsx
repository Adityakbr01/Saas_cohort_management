import AppRoutes from "@/routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";

const RoutingLayout = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default RoutingLayout;
