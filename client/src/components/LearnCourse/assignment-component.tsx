"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, File, CheckCircle, Calendar, Download, MessageSquare, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssignmentComponentProps {
  assignment: any
  onComplete: () => void
}

export default function AssignmentComponent({ assignment, onComplete }: AssignmentComponentProps) {
  const [submissionText, setSubmissionText] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitted, setIsSubmitted] = useState(assignment.isSubmitted || false)
  const [feedback, setFeedback] = useState(assignment.feedback || null)

  // Mock assignment data
  const assignmentData = {
    title: "React Component Architecture",
    description:
      "Build a complete React application demonstrating component composition, state management, and best practices.",
    instructions: `Create a React application that includes:

1. At least 5 functional components
2. Proper state management using hooks
3. Component composition patterns
4. Error boundaries
5. Responsive design
6. Unit tests for key components

Submit your code as a ZIP file along with a README explaining your architecture decisions.`,
    dueDate: "2024-02-15T23:59:59Z",
    maxPoints: 100,
    submissionTypes: ["file", "text"],
    rubric: [
      { criteria: "Code Quality", points: 25, description: "Clean, readable, and well-structured code" },
      { criteria: "Functionality", points: 25, description: "All requirements implemented correctly" },
      { criteria: "Design Patterns", points: 25, description: "Proper use of React patterns and best practices" },
      { criteria: "Testing", points: 15, description: "Comprehensive unit tests" },
      { criteria: "Documentation", points: 10, description: "Clear README and code comments" },
    ],
    resources: [
      { name: "React Best Practices Guide", url: "#", type: "pdf" },
      { name: "Component Architecture Examples", url: "#", type: "link" },
      { name: "Testing Template", url: "#", type: "zip" },
    ],
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const submitAssignment = () => {
    // In a real app, this would upload files and submit to backend
    setIsSubmitted(true)
    onComplete()

    // Mock feedback after submission
    setTimeout(() => {
      setFeedback({
        score: 85,
        maxScore: 100,
        grade: "B+",
        comments:
          "Excellent work on component architecture! Your use of hooks is well-implemented. Consider adding more comprehensive error handling for edge cases.",
        rubricScores: [
          { criteria: "Code Quality", score: 22, maxScore: 25, feedback: "Very clean and readable code" },
          { criteria: "Functionality", score: 23, maxScore: 25, feedback: "All requirements met successfully" },
          {
            criteria: "Design Patterns",
            score: 20,
            maxScore: 25,
            feedback: "Good patterns, could improve composition",
          },
          { criteria: "Testing", score: 12, maxScore: 15, feedback: "Good test coverage, missing edge cases" },
          {
            criteria: "Documentation",
            score: 8,
            maxScore: 10,
            feedback: "Clear documentation, could be more detailed",
          },
        ],
        submittedAt: new Date().toISOString(),
        gradedAt: new Date().toISOString(),
      })
    }, 2000)
  }

  const getDaysUntilDue = () => {
    const dueDate = new Date(assignmentData.dueDate)
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilDue = getDaysUntilDue()
  const isOverdue = daysUntilDue < 0
  const isUrgent = daysUntilDue <= 2 && daysUntilDue > 0

  if (feedback) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Assignment Feedback
          </CardTitle>
          <CardDescription>Instructor feedback for your submission</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grade Summary */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">{feedback.grade}</div>
            <div className="text-muted-foreground">
              {feedback.score} out of {feedback.maxScore} points
            </div>
            <Progress value={(feedback.score / feedback.maxScore) * 100} className="h-3" />
          </div>

          {/* Overall Comments */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Instructor Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{feedback.comments}</p>
            </CardContent>
          </Card>

          {/* Rubric Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium">Rubric Breakdown</h4>
            {feedback.rubricScores.map((item: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{item.criteria}</h5>
                    <Badge variant="outline">
                      {item.score}/{item.maxScore}
                    </Badge>
                  </div>
                  <Progress value={(item.score / item.maxScore) * 100} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">{item.feedback}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submission Details */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Submitted: {new Date(feedback.submittedAt).toLocaleString()}</p>
            <p>Graded: {new Date(feedback.gradedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              {assignmentData.title}
            </CardTitle>
            <CardDescription>{assignmentData.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isSubmitted && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Submitted
              </Badge>
            )}
            <Badge variant="outline">{assignmentData.maxPoints} points</Badge>
            <Badge
              variant="outline"
              className={cn(
                isOverdue && "bg-red-100 text-red-800 border-red-300",
                isUrgent && "bg-orange-100 text-orange-800 border-orange-300",
              )}
            >
              <Calendar className="h-3 w-3 mr-1" />
              {isOverdue
                ? `Overdue by ${Math.abs(daysUntilDue)} days`
                : isUrgent
                  ? `Due in ${daysUntilDue} days`
                  : `Due ${new Date(assignmentData.dueDate).toLocaleDateString()}`}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="space-y-3">
          <h3 className="font-medium">Instructions</h3>
          <div className="bg-muted/50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm font-mono">{assignmentData.instructions}</pre>
          </div>
        </div>

        {/* Rubric */}
        <div className="space-y-3">
          <h3 className="font-medium">Grading Rubric</h3>
          <div className="space-y-2">
            {assignmentData.rubric.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{item.criteria}</h4>
                    <Badge variant="outline">{item.points} points</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-3">
          <h3 className="font-medium">Resources</h3>
          <div className="space-y-2">
            {assignmentData.resources.map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{resource.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {resource.type.toUpperCase()}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Form */}
        {!isSubmitted && (
          <div className="space-y-4">
            <h3 className="font-medium">Your Submission</h3>

            {/* Text Submission */}
            {assignmentData.submissionTypes.includes("text") && (
              <div className="space-y-2">
                <Label htmlFor="submission-text">Written Response</Label>
                <Textarea
                  id="submission-text"
                  placeholder="Enter your written response here..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
            )}

            {/* File Upload */}
            {assignmentData.submissionTypes.includes("file") && (
              <div className="space-y-2">
                <Label htmlFor="file-upload">File Upload</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                  <Input id="file-upload" type="file" multiple onChange={handleFileUpload} className="hidden" />
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Choose Files
                    </label>
                  </Button>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Uploaded Files</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={submitAssignment}
              disabled={!submissionText.trim() && uploadedFiles.length === 0}
              className="w-full"
            >
              Submit Assignment
            </Button>
          </div>
        )}

        {/* Submission Confirmation */}
        {isSubmitted && !feedback && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium text-green-800 mb-1">Assignment Submitted!</h4>
              <p className="text-sm text-green-700">
                Your assignment has been submitted successfully. You will receive feedback once it's graded.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
