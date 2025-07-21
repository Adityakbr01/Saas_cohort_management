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
import type { codeExamples } from "@/types/cohort"

interface CodeExamplesTabProps {
  lesson: {
    codeExamples?: codeExamples[]
  }
}

export default function CodeExamplesTab({ lesson }: CodeExamplesTabProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const codeExamples = lesson.codeExamples || []

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
                    {example.level && (
                      <Badge variant="outline" className={getDifficultyColor(example.level)}>
                        {example.level}
                      </Badge>
                    )}
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

                  {example.language === "javascript" || example.language === "typescript" ? (
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
                  ) : null}
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
