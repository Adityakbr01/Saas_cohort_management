import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useGetLessonCodeExamplesQuery,
  useGetLessonResourcesQuery,
  useUpdateCodeExampleMutation,
  useDeleteCodeExampleMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} from '@/store/features/api/lessons/lesson';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader, Edit, Trash2, FileText, File } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { FancyFileUploader } from './FancyFileUploader';

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

// Zod schema for code update (matches backend)
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

const resourceDataSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  type: z.enum(["pdf", "doc", "link"]),
  url: z.string().url("Invalid URL format").optional().or(z.literal("")),
  description: z.string().max(1000, "Description is too long").optional().default(""),
});

// Types for resource and code forms
type CodeExample = {
  _id: string;
  title: string;
  language: string;
  version: number;
  level: string;
  code: string;
  description?: string;
};
type Resource = {
  _id: string;
  title: string;
  type: 'pdf' | 'doc' | 'link';
  url?: string;
  description?: string;
  file?: File | null;
};

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES: Record<'pdf' | 'doc', string[]> = {
  pdf: ['application/pdf'],
  doc: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-word.document.macroEnabled.12',
    'application/vnd.ms-word.template.macroEnabled.12',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    'application/vnd.ms-word',
    'application/doc',
    'application/docx',
    '.doc',
    '.docx',
  ],
};

const LessonResourceManager: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { data: codeExamples, refetch: refetchCodes, isLoading: loadingCodes } = useGetLessonCodeExamplesQuery(lessonId!, { skip: !lessonId });
  const { data: resources, refetch: refetchResources, isLoading: loadingResources } = useGetLessonResourcesQuery(lessonId!, { skip: !lessonId });
  const [updateCodeExample] = useUpdateCodeExampleMutation();
  const [deleteCodeExample] = useDeleteCodeExampleMutation();
  const [updateResource] = useUpdateResourceMutation();
  const [deleteResource] = useDeleteResourceMutation();

  // Edit dialog state
  const [editingCode, setEditingCode] = useState<CodeExample | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResourceEditDialogOpen, setIsResourceEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CodeExample>>({});
  const [editResourceForm, setEditResourceForm] = useState<Partial<Resource>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'code' | 'resource', id: string } | null>(null);
  const [editCodeErrors, setEditCodeErrors] = useState<Record<string, string>>({});
  const [editResourceErrors, setEditResourceErrors] = useState<Record<string, string>>({});

  // Handlers
  const handleEditCode = (code: CodeExample) => {
    setEditingCode(code);
    setEditForm({ ...code });
    setIsEditDialogOpen(true);
  };
  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setEditResourceForm({ ...resource });
    setIsResourceEditDialogOpen(true);
  };
  const handleSaveCode = async () => {
    setEditCodeErrors({});
    const parsed = codeDataSchema.safeParse(editForm);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setEditCodeErrors({
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
      await updateCodeExample({ codeId: editingCode!._id, updates: parsed.data }).unwrap();
      toast.success('Code example updated');
      setIsEditDialogOpen(false);
      setEditingCode(null);
      refetchCodes();
    } catch {
      toast.error('Failed to update code example');
    }
  };
  const handleSaveResource = async () => {
    setEditResourceErrors({});
    const parsed = resourceDataSchema.safeParse(editResourceForm);
    const errors: Record<string, string> = {};
    // File validation (if type is pdf or doc)
    if ((editResourceForm.type === 'pdf' || editResourceForm.type === 'doc') && editResourceForm.file) {
      const file = editResourceForm.file;
      if (file.size > MAX_FILE_SIZE) {
        errors.file = 'File size must be less than 10MB';
      }
      const allowedTypes = ALLOWED_FILE_TYPES[editResourceForm.type];
      if (!allowedTypes.some((type: string) => file.type === type || file.name.endsWith(type))) {
        errors.file = 'Invalid file type. Only PDF or DOC files are allowed.';
      }
    }
    // URL validation for links
    if (editResourceForm.type === 'link' && editResourceForm.url) {
      try {
        new URL(editResourceForm.url);
      } catch {
        errors.url = 'Invalid URL format';
      }
    }
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      errors.title = fieldErrors.title?.[0] || '';
      errors.type = fieldErrors.type?.[0] || '';
      errors.url = errors.url || fieldErrors.url?.[0] || '';
      errors.description = fieldErrors.description?.[0] || '';
    }
    // If any errors, show and return
    if (Object.values(errors).some(Boolean)) {
      setEditResourceErrors(errors);
      return;
    }
    try {
      // If file, send as FormData
      if ((editResourceForm.type === 'pdf' || editResourceForm.type === 'doc') && editResourceForm.file) {
        const formData = new FormData();
        formData.append('title', editResourceForm.title || '');
        formData.append('type', editResourceForm.type);
        formData.append('description', editResourceForm.description ?? '');
        if (editResourceForm.file) formData.append('file', editResourceForm.file);
        await updateResource({ resourceId: editingResource!._id, updates: formData }).unwrap();
      } else {
        await updateResource({ resourceId: editingResource!._id, updates: parsed.data }).unwrap();
      }
      toast.success('Resource updated');
      setIsResourceEditDialogOpen(false);
      setEditingResource(null);
      refetchResources();
    } catch {
      toast.error('Failed to update resource');
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'code') {
        await deleteCodeExample(deleteTarget.id).unwrap();
        refetchCodes();
      } else {
        await deleteResource(deleteTarget.id).unwrap();
        refetchResources();
      }
      toast.success('Deleted successfully');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Lesson Code & Resources</h2>
      <Separator className="mb-6" />
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FileText className="w-5 h-5" /> Code Examples</h3>
        {loadingCodes ? <Loader className="animate-spin" /> : (
          <div className="space-y-4">
            {codeExamples?.data?.length === 0 && <div className="text-muted-foreground">No code examples.</div>}
            {codeExamples?.data?.map((code: CodeExample) => (
              <div key={code._id} className="rounded-lg border bg-muted p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{code.title}</span>
                    <span className="text-xs bg-gray-200 rounded px-2 py-0.5">{code.language}</span>
                    <span className="text-xs bg-gray-200 rounded px-2 py-0.5">v{code.version}</span>
                    <span className="text-xs bg-gray-200 rounded px-2 py-0.5">{code.level}</span>
                  </div>
                  <CodeMirror
                    value={code.code}
                    height="120px"
                    theme={oneDark}
                    extensions={[getLanguageExtension(code.language)]}
                    readOnly
                  />
                  <div className="text-xs text-muted-foreground mt-1">{code.description}</div>
                </div>
                <div className="flex flex-col gap-2 min-w-[90px]">
                  <Button variant="outline" size="sm" onClick={() => handleEditCode(code)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTarget({ type: 'code', id: code._id })}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Separator className="mb-6" />
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><File className="w-5 h-5" /> Resources</h3>
        {loadingResources ? <Loader className="animate-spin" /> : (
          <div className="space-y-4">
            {resources?.data?.length === 0 && <div className="text-muted-foreground">No resources.</div>}
            {resources?.data?.map((resource: Resource) => (
              <div key={resource._id} className="rounded-lg border bg-muted p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{resource.title}</span>
                    <span className="text-xs bg-gray-200 rounded px-2 py-0.5">{resource.type}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{resource.description}</div>
                  {resource.url && <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View Resource</a>}
                </div>
                <div className="flex flex-col gap-2 min-w-[90px]">
                  <Button variant="outline" size="sm" onClick={() => handleEditResource(resource)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTarget({ type: 'resource', id: resource._id })}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Edit Code Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl w-full">
          <DialogHeader>
            <DialogTitle>Edit Code Example</DialogTitle>
          </DialogHeader>
          <Input
            className="mb-2"
            placeholder="Title"
            value={editForm.title || ''}
            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
          />
          <Select
            value={editForm.language || ''}
            onValueChange={value => setEditForm({ ...editForm, language: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Language" />
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
          {editCodeErrors.language && <p className="text-xs text-red-500">{editCodeErrors.language}</p>}
          <Input
            className="mb-2"
            placeholder="Version"
            type="number"
            value={editForm.version !== undefined ? String(editForm.version) : ''}
            onChange={e => setEditForm({ ...editForm, version: e.target.value === '' ? undefined : Number(e.target.value) })}
            required
          />
          <Select
            value={editForm.level || ''}
            onValueChange={value => setEditForm({ ...editForm, level: value })}
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
          {editCodeErrors.level && <p className="text-xs text-red-500">{editCodeErrors.level}</p>}
          <CodeMirror
            value={editForm.code || ''}
            height="120px"
            theme={oneDark}
            extensions={[getLanguageExtension(editForm.language!)]}
            onChange={value => setEditForm({ ...editForm, code: value })}
          />
          <Textarea
            className="mb-2"
            placeholder="Description"
            value={editForm.description || ''}
            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCode}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Resource Dialog */}
      <Dialog open={isResourceEditDialogOpen} onOpenChange={setIsResourceEditDialogOpen}>
        <DialogContent className="max-w-xl w-full">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          <Input
            className="mb-2"
            placeholder="Title"
            value={editResourceForm.title || ''}
            onChange={e => setEditResourceForm({ ...editResourceForm, title: e.target.value })}
          />
          {editResourceErrors.title && <p className="text-xs text-red-500">{editResourceErrors.title}</p>}
          <Input
            className="mb-2"
            placeholder="Type"
            value={editResourceForm.type || ''}
            onChange={e => setEditResourceForm({ ...editResourceForm, type: e.target.value as 'pdf' | 'doc' | 'link' })}
          />
          {(editResourceForm.type === 'pdf' || editResourceForm.type === 'doc') && (
            <>
              <FancyFileUploader
                label="Upload File"
                accept={editResourceForm.type === 'pdf' ? 'application/pdf' : '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
                onFileSelect={file => setEditResourceForm({ ...editResourceForm, file })}
              />
              {editResourceErrors.file && <p className="text-xs text-red-500">{editResourceErrors.file}</p>}
            </>
          )}
          <Input
            className="mb-2"
            placeholder="Resource URL"
            value={editResourceForm.url ?? ''}
            onChange={e => setEditResourceForm({ ...editResourceForm, url: e.target.value })}
          />
          {editResourceErrors.url && <p className="text-xs text-red-500">{editResourceErrors.url}</p>}
          <Textarea
            className="mb-2"
            placeholder="Description"
            value={editResourceForm.description || ''}
            onChange={e => setEditResourceForm({ ...editResourceForm, description: e.target.value })}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResourceEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveResource}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this {deleteTarget?.type}?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader className="w-4 h-4 animate-spin mr-1" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonResourceManager; 
