import React from "react";

import { Menu, X, PanelRight, PanelRightClose } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { CohortData } from "@/types/cohort";


interface HeaderProps {
  cohortData: CohortData;
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  rightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  cohortData,
  leftSidebarOpen,
  setLeftSidebarOpen,
  rightSidebarOpen,
  toggleRightSidebar,
}) => {
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="lg:hidden"
            >
              {leftSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div>
              <h1 className="text-xl font-bold">{cohortData ? cohortData.title : "Loading..."}</h1>
              <p className="text-sm text-muted-foreground">{cohortData ? cohortData.description : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRightSidebar}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              title={rightSidebarOpen ? "Hide course content panel" : "Show course content panel"}
            >
              {rightSidebarOpen ? (
                <>
                  <PanelRightClose className="h-4 w-4" />
                  <span className="hidden sm:inline">Hide Panel</span>
                </>
              ) : (
                <>
                  <PanelRight className="h-4 w-4" />
                  <span className="hidden sm:inline">Show Panel</span>
                </>
              )}
            </Button>
            <div className="text-right">
              <p className="text-sm font-medium">{cohortData ? `${cohortData.progress.overall}% Complete` : ""}</p>
              {cohortData && <Progress value={cohortData.progress.overall} className="w-32" />}
            </div>
            {cohortData && (
              <Avatar>
                <AvatarImage src={cohortData.instructor.avatar || "/placeholder.svg"} alt={cohortData.instructor.name} />
                <AvatarFallback>
                  {cohortData.instructor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;