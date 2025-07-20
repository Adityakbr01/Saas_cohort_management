import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeleteLessonMutation, useUploadCodeMutation, useUploadResourceMutation } from "@/store/features/api/lessons/lesson";

import { Clock, Edit, GripVertical, Trash2, Video, Book, Link as LinkIcon, FileText, FileQuestion, Upload } from "lucide-react";
import { toast } from "sonner";
import { formatDuration } from "@/utils/formatDuration";
import type { Chapter, Lesson } from "@/types";
import { useState } from "react";
import { Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FancyFileUploader } from "./FancyFileUploader";
import { z } from "zod";
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { Link as RouterLink } from "react-router-dom";
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';


export type DragItem =
  | (Chapter & { type: "module" })
  | (Lesson & { type: "Lesson" });

interface LectureItemProps {
  lecture: Lesson;
  lectureIndex: number;
  setEditingItem: (item: Lesson | Chapter | null) => void;
  refetch: () => void;
}

const LectureItem: React.FC<LectureItemProps> = ({
  lecture,
  setEditingItem,
  refetch,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "inProgress":
        return "secondary";
      case "upcoming":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "text":
        return <FileText className="h-4 w-4" />;
      case "interactive":
        return <FileQuestion className="h-4 w-4" />;
      case "reading":
        return <Book className="h-4 w-4" />;
      case "link":
        return <LinkIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };


  const [deleteLectureMutation] = useDeleteLessonMutation();
  const [uploadCodeMutation, { isLoading: isUploadingCode }] = useUploadCodeMutation();
  const [uploadResourceMutation, { isLoading: isUploadingResource }] = useUploadResourceMutation();
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [codeForm, setCodeForm] = useState({
    language: "",
    code: "",
    description: "",
    isStarter: false,
    isSolution: false,
    version: "1",
    title: "",
    runLink: "",
    level: "",
  });
  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "pdf",
    description: "",
    file: null as File | null,
    url: "",
  });
  const [codeErrors, setCodeErrors] = useState<Record<string, string>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteLecture = async (lectureId: string) => {
    try {
      await deleteLectureMutation(lectureId).unwrap();
      toast.success("Lecture deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting lecture:", error);
      toast.error("Failed to delete lecture", {
        description: "Please try again later.",
      });
    }
  };

  // Zod schema for code upload (matches backend)
  const codeDataSchema = z.object({
    language: z.enum([
      "javascript",
      "typescript",
      "python",
      "java",
      "cpp",
      "php",
      "go",
      "rust",
      "html",
      "css",
    ], {
      errorMap: () => ({ message: "Invalid programming language" }),
    }),
    code: z.string().min(1, "Code is required").max(10000, "Code is too long"),
    description: z.string().max(1000, "Description is too long").optional().default(""),
    isStarter: z.boolean().default(false),
    isSolution: z.boolean().default(false),
    version: z.coerce.number().min(1, "Version must be at least 1").default(1),
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    runLink: z.string().url("Invalid URL format").optional().or(z.literal("")).default(""),
    level: z.enum(["easy", "medium", "hard"]).default("easy"),
  });

  const handleUploadCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeErrors({});
    const parsed = codeDataSchema.safeParse(codeForm);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setCodeErrors({
        language: fieldErrors.language?.[0] || "",
        code: fieldErrors.code?.[0] || "",
        description: fieldErrors.description?.[0] || "",
        isStarter: fieldErrors.isStarter?.[0] || "",
        isSolution: fieldErrors.isSolution?.[0] || "",
        version: fieldErrors.version?.[0] || "",
        title: fieldErrors.title?.[0] || "",
        runLink: fieldErrors.runLink?.[0] || "",
        level: fieldErrors.level?.[0] || "",
      });
      return;
    }
    try {
      await uploadCodeMutation({ lessonId: lecture._id, code: parsed.data }).unwrap();
      toast.success("Code uploaded successfully");
      setIsCodeDialogOpen(false);
      setCodeForm({
        language: "",
        code: "",
        description: "",
        isStarter: false,
        isSolution: false,
        version: "1",
        title: "",
        runLink: "",
        level: "easy",
      });
      setCodeErrors({});
      refetch();
    } catch {
      toast.error("Failed to upload code");
    }
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let resource: FormData | Record<string, unknown> = {
        title: resourceForm.title,
        type: resourceForm.type,
        description: resourceForm.description,
      };
      if (resourceForm.type === "pdf" || resourceForm.type === "doc") {
        const formData = new FormData();
        formData.append("title", resourceForm.title);
        formData.append("type", resourceForm.type);
        formData.append("description", resourceForm.description);
        if (resourceForm.file) formData.append("file", resourceForm.file);
        resource = formData;
      } else if (resourceForm.type === "link") {
        if (typeof resource === "object" && !(resource instanceof FormData)) resource.url = resourceForm.url;
      }
      await uploadResourceMutation({ lessonId: lecture._id, resource }).unwrap();
      toast.success("Resource uploaded successfully");
      setIsResourceDialogOpen(false);
      setResourceForm({
        title: "",
        type: "pdf",
        description: "",
        file: null,
        url: "",
      });
      refetch();
    } catch {
      toast.error("Failed to upload resource");
    }
  };

  // Helper to get CodeMirror language extension
  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case 'javascript': return javascript();
      case 'typescript': return javascript({ typescript: true });
      case 'python': return python();
      case 'java': return java();
      case 'php': return php();
      case 'rust': return rust();
      case 'cpp': return cpp();
      case 'go': return go();
      case 'html': return html();
      case 'css': return css();
      default: return markdown();
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-200`}

    >
      <Tooltip>
        <TooltipTrigger>
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab hover:text-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Drag to reorder lectures</p>
        </TooltipContent>
      </Tooltip>
      <div className="flex items-center gap-2">
        {getTypeIcon(lecture.contentType)}
        <Badge variant={getStatusColor(lecture.status)} className="text-xs">
          {lecture.status}
        </Badge>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-sm">{lecture.title}</p>
            <p className="text-xs text-muted-foreground">{lecture.shortDescription}</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {lecture.duration ? formatDuration(lecture.duration) : "Duration not available"}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{lecture.duration ? `${lecture.duration} seconds` : "Duration not available"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="sm" onClick={() => setEditingItem(lecture)}>
              <Edit className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit lecture</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent >
            <p>Delete lecture</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="sm" onClick={() => setIsCodeDialogOpen(true)}>
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload code example</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="sm" onClick={() => setIsResourceDialogOpen(true)}>
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload resource</p>
          </TooltipContent>
        </Tooltip>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="mt-1"
          aria-label="Manage code and resources"
        >
          <RouterLink to={`/lesson/${lecture._id}/manage`}>
            <FileText className="w-4 h-4 mr-1" /> Manage
          </RouterLink>
        </Button>
      </div>
      {/* Upload Code Dialog */}
      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
        <AnimatePresence>
          {isCodeDialogOpen && (
            <DialogContent forceMount className="max-w-2xl w-full rounded-xl shadow-xl bg-background p-6 scrollbar-hide overflow-y-auto max-h-[90vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold mb-2">Upload Code Example</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUploadCode} className="space-y-6">
                  {/* Basic Info Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Basic Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                        <Input
                          placeholder="Title"
                          value={codeForm.title}
                          onChange={e => setCodeForm({ ...codeForm, title: e.target.value })}
                          required
                        />
                        {codeErrors.title && <p className="text-xs text-red-500 mt-1">{codeErrors.title}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Language <span className="text-red-500">*</span></label>
                        <Select
                          value={codeForm.language}
                          onValueChange={value => setCodeForm({ ...codeForm, language: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                            <SelectItem value="php">PHP</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                            <SelectItem value="rust">Rust</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                            <SelectItem value="css">CSS</SelectItem>
                          </SelectContent>
                        </Select>
                        {codeErrors.language && <p className="text-xs text-red-500 mt-1">{codeErrors.language}</p>}
                      </div>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  {/* Code Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Code</h3>
                    <div className="rounded-lg border bg-muted p-2 shadow-sm">
                      <CodeMirror
                        value={codeForm.code}
                        height="220px"
                        theme={oneDark}
                        extensions={[getLanguageExtension(codeForm.language)]}
                        onChange={value => setCodeForm({ ...codeForm, code: value })}
                        basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
                      />
                    </div>
                    {codeErrors.code && <p className="text-xs text-red-500 mt-1">{codeErrors.code}</p>}
                    <label className="block text-sm font-medium mt-4 mb-1">Description <span className="text-xs text-muted-foreground">(optional)</span></label>
                    <Textarea
                      placeholder="Description (optional)"
                      value={codeForm.description}
                      onChange={e => setCodeForm({ ...codeForm, description: e.target.value })}
                      className="resize-y min-h-[60px]"
                    />
                    {codeErrors.description && <p className="text-xs text-red-500 mt-1">{codeErrors.description}</p>}
                  </div>
                  <Separator className="my-2" />
                  {/* Meta Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Meta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Version <span className="text-red-500">*</span></label>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Version"
                          value={String(codeForm.version)}
                          onChange={e => setCodeForm({ ...codeForm, version: e.target.value })}
                          required
                        />
                        <span className="text-xs text-muted-foreground">Version must be at least 1</span>
                        {codeErrors.version && <p className="text-xs text-red-500 mt-1">{codeErrors.version}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Level <span className="text-red-500">*</span></label>
                        <Select
                          value={codeForm.level}
                          onValueChange={value => setCodeForm({ ...codeForm, level: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground">Choose the code difficulty</span>
                        {codeErrors.level && <p className="text-xs text-red-500 mt-1">{codeErrors.level}</p>}
                      </div>
                    </div>
                    <div className="flex gap-6 items-center mt-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isStarter"
                          checked={codeForm.isStarter}
                          onCheckedChange={checked => setCodeForm({ ...codeForm, isStarter: !!checked })}
                        />
                        <label htmlFor="isStarter" className="text-sm">Starter</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isSolution"
                          checked={codeForm.isSolution}
                          onCheckedChange={checked => setCodeForm({ ...codeForm, isSolution: !!checked })}
                        />
                        <label htmlFor="isSolution" className="text-sm">Solution</label>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1">Run Link <span className="text-xs text-muted-foreground">(optional, must be a valid URL)</span></label>
                      <Input
                        placeholder="Run Link (optional)"
                        value={codeForm.runLink}
                        onChange={e => setCodeForm({ ...codeForm, runLink: e.target.value })}
                      />
                      {codeErrors.runLink && <p className="text-xs text-red-500 mt-1">{codeErrors.runLink}</p>}
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCodeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploadingCode} className="ml-2">
                      {isUploadingCode ? <span className="animate-spin mr-2"><Loader className="w-4 h-4" /></span> : null}
                      Upload
                    </Button>
                  </DialogFooter>
                </form>
              </motion.div>
            </DialogContent>
          )}
        </AnimatePresence>
      </Dialog>
      {/* Upload Resource Dialog */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className=" overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Upload Resource</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadResource} className="space-y-3 overflow-y-auto">
            <Input
              placeholder="Title"
              value={resourceForm.title}
              onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
              required
            />
            <Select
              value={resourceForm.type}
              onValueChange={value => setResourceForm({ ...resourceForm, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="doc">Document</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Description"
              value={resourceForm.description}
              onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })}
            />
            {(resourceForm.type === "pdf" || resourceForm.type === "doc") && (
              <FancyFileUploader
                label="Upload File"
                accept={resourceForm.type === "pdf" ? "application/pdf" : ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
                onFileSelect={file => setResourceForm({ ...resourceForm, file })}
              />
            )}
            {resourceForm.type === "link" && (
              <Input
                placeholder="Resource URL"
                value={resourceForm.url}
                onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResourceDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploadingResource}>
                {isUploadingResource ? <span className="animate-spin mr-2"><Loader className="w-4 h-4" /></span> : null}
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Lesson Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this lesson?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { handleDeleteLecture(lecture._id); setIsDeleteDialogOpen(false); }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LectureItem;