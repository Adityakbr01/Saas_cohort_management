import React from "react";

import { Download, PanelRight, PanelRightClose, Clock, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CommentSystem from "./comment-system";
import CodeExamplesTab from "./code-examples-tab";
import type { Lesson } from "@/types/cohort";


interface RightSidebarProps {
  rightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
  selectedLesson: Lesson | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  rightSidebarOpen,
  toggleRightSidebar,
  selectedLesson,
  activeTab,
  setActiveTab,
}) => {
  return (
    <aside
      className={`${rightSidebarOpen ? "w-96" : "w-0"} transition-all duration-300 overflow-hidden border-l bg-card relative`}
    >
      {!rightSidebarOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleRightSidebar}
          className="absolute -left-10 top-4 z-10 bg-background border shadow-md hover:shadow-lg transition-shadow"
          title="Show course content panel"
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Course Content</h3>
          <Button variant="ghost" size="sm" onClick={toggleRightSidebar} title="Hide course content panel">
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Overview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="resources">Files</TabsTrigger>
            <TabsTrigger value="discussions">Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lesson Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-muted-foreground">{selectedLesson?.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedLesson?.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {selectedLesson?.type}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">My Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-32 p-3 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add your notes here..."
                />
                <Button size="sm" className="mt-2">Save Notes</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="code" className="space-y-4">
            {selectedLesson && <CodeExamplesTab lesson={selectedLesson} />}
          </TabsContent>
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedLesson?.resources && selectedLesson.resources.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLesson.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-2 border rounded text-sm">
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {resource.type.toUpperCase()}
                            {resource.size && ` • ${resource.size}`}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No resources available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="discussions" className="space-y-4">
            {selectedLesson && <CommentSystem lessonId={selectedLesson.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
};

export default RightSidebar;