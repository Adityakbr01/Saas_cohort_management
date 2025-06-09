import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes/AppRoutes";

const RoutingLayout = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default RoutingLayout;
