import React from "react";

import type { Lesson } from "@/types/cohort";
import { formatDuration } from "@/utils/formatDuration";
import { BookOpen, Clock, Code, Download } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import CodeExamplesTab from "./code-examples-tab";
import CommentSystem from "./comment-system";


interface RightSidebarProps {

  selectedLesson: Lesson | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedLesson,
  activeTab,
  setActiveTab,
}) => {


  return (
    <div
      className={`flex flex-col h-full scrollbar-hidden overflow-auto`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-1.5"> <Code /> Lesson Resources</h3>
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
                  <p className="text-muted-foreground">{selectedLesson?.description || selectedLesson?.shortDescription || "No Description"}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(Number(selectedLesson?.duration))}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {selectedLesson?.type}
                  </span>
                </div>
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
                            {resource?.type?.toUpperCase()}
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
    </div>
  );
};

export default RightSidebar;