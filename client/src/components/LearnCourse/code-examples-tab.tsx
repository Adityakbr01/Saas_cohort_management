import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Play, ExternalLink, Code2 } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"

interface CodeExample {
  id: string
  title: string
  language: string
  description: string
  code: string
  runnable: boolean
  difficulty: "beginner" | "intermediate" | "advanced"
}

interface CodeExamplesTabProps {
  lesson: any
}

export default function CodeExamplesTab({ lesson }: CodeExamplesTabProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  console.log(lesson)

  const codeExamples: CodeExample[] = [
    {
      id: "example_1",
      title: "Basic React Component",
      language: "javascript",
      description: "A simple functional component demonstrating props and state",
      code: `import React, { useState } from 'react';

function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue);

  return (
    <div className=\"counter\">
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

export default Counter;`,
      runnable: true,
      difficulty: "beginner",
    },
    {
      id: "example_2",
      title: "API Data Fetching",
      language: "typescript",
      description: "Using useEffect and fetch to load data from an API",
      code: `import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map((user: any) => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}

export default UserList;`,
      runnable: true,
      difficulty: "intermediate",
    },
    {
      id: "example_3",
      title: "CSS Styling",
      language: "css",
      description: "Responsive card component styling",
      code: `.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 1rem 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}`,
      runnable: false,
      difficulty: "beginner",
    },
  ]

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLanguageIcon = (language: string) => {
    const icons: Record<string, string> = {
      javascript: "🟨",
      typescript: "🔷",
      css: "🎨",
      html: "🌐",
      python: "🐍",
      java: "☕",
      c: "🔣",
      cpp: "➕",
      go: "🐹",
      ruby: "💎",
      rust: "🦀",
      php: "🐘",
      swift: "🕊️",
    }
    return icons[language] || "💻"
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4" /> Code Examples
          </CardTitle>
          <CardDescription>
            Interactive code examples for this lesson. Copy and run in your IDE.
          </CardDescription>
        </CardHeader>
      </Card>

      {codeExamples.length > 0 ? (
        <div className="space-y-4">
          {codeExamples.map((example) => (
            <Card key={example.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getLanguageIcon(example.language)}</span>
                    <CardTitle className="text-sm">{example.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getDifficultyColor(example.difficulty)}>
                      {example.difficulty}
                    </Badge>
                    <Badge variant="outline">{example.language}</Badge>
                  </div>
                </div>
                <CardDescription className="text-xs">{example.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <SyntaxHighlighter language={example.language} style={oneDark} className="rounded-md text-xs">
                  {example.code}
                </SyntaxHighlighter>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(example.code, example.id)}
                    className="flex items-center gap-1"
                  >
                    {copiedCode === example.id ? (
                      <>
                        <Check className="h-3 w-3" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </Button>

                  {example.runnable && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 bg-transparent"
                        onClick={() => window.open("https://codesandbox.io/s/new?template=react", "_blank")}
                      >
                        <Play className="h-3 w-3" /> Run Online
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 bg-transparent"
                        onClick={() => {
                          const blob = new Blob([example.code], { type: "text/plain" })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `${example.title.toLowerCase().replace(/\s+/g, "-")}.${example.language === "javascript" ? "js" : example.language}`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <ExternalLink className="h-3 w-3" /> Download
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Code2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No code examples available for this lesson.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
