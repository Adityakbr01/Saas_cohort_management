import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">403 - Unauthorized</h1>
        <p className="text-muted-foreground">
          You don’t have permission to access this page.
        </p>
        <Button onClick={() => navigate("/login")} variant="default" className="cursor-pointer">
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;