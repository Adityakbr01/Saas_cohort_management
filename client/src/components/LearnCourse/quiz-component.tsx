import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Question, Quiz } from "@/types/cohort"
import { AlertCircle, CheckCircle, Clock, FileText, Flag, RotateCcw, Trophy, XCircle } from "lucide-react"
import { useEffect, useState } from "react"




interface QuizComponentProps {
  quiz: Quiz
  onComplete: () => void
}

export default function QuizComponent({ quiz, onComplete }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit || 1800) // 30 minutes default
  const [isSubmitted, setIsSubmitted] = useState(false)


  // ⬇️ Add this useEffect below your state declarations
useEffect(() => {
  if (isSubmitted) return

  const timer = setInterval(() => {
    setTimeRemaining((prevTime) => {
      if (prevTime <= 1) {
        clearInterval(timer)
        setShowResults(true)
        setIsSubmitted(true)
        onComplete()
        return 0
      }
      return prevTime - 1
    })
  }, 1000)

  return () => clearInterval(timer)
}, [isSubmitted, onComplete]) // ✅ Add onComplete here


  // Mock questions - in a real app, this would come from the quiz data
  const questions: Question[] = [
    {
      id: "q1",
      type: "multiple-choice",
      question: "What is the primary purpose of React hooks?",
      options: [
        "To replace class components entirely",
        "To allow state and lifecycle features in functional components",
        "To improve performance of React applications",
        "To handle routing in React applications",
      ],
      correctAnswer: "To allow state and lifecycle features in functional components",
      explanation:
        "React hooks were introduced to allow functional components to use state and other React features that were previously only available in class components.",
      points: 2,
    },
    {
      id: "q2",
      type: "multiple-select",
      question: "Which of the following are valid React hooks? (Select all that apply)",
      options: ["useState", "useEffect", "useContext", "useRouter", "useMemo"],
      correctAnswer: ["useState", "useEffect", "useContext", "useMemo"],
      explanation:
        "useState, useEffect, useContext, and useMemo are all built-in React hooks. useRouter is not a React hook but rather a Next.js hook.",
      points: 3,
    },
    {
      id: "q3",
      type: "true-false",
      question: "React components must always return JSX elements.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation:
        "React components can return JSX elements, strings, numbers, arrays, fragments, or null. They don't always have to return JSX elements.",
      points: 1,
    },
    {
      id: "q4",
      type: "short-answer",
      question: "Explain the difference between props and state in React.",
      correctAnswer:
        "Props are read-only data passed from parent to child components, while state is mutable data managed within a component.",
      explanation:
        "Props are immutable data passed down from parent components, while state is mutable data that belongs to and is managed by the component itself.",
      points: 4,
    },
  ]

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  const currentQuestionData = questions[currentQuestion]

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const calculateScore = () => {
    let score = 0
    questions.forEach((question) => {
      const userAnswer = answers[question.id]
      if (question.type === "multiple-select") {
        const correct = Array.isArray(question.correctAnswer) ? question.correctAnswer : []
        const user = Array.isArray(userAnswer) ? userAnswer : []
        if (correct.length === user.length && correct.every((ans) => user.includes(ans))) {
          score += question.points
        }
      } else if (question.type === "short-answer") {
        if (typeof question.correctAnswer === "string" && typeof userAnswer === "string") {
          const correctKeywords = question.correctAnswer.toLowerCase().split(" ")
          const userKeywords = userAnswer.toLowerCase().split(" ")
          const matchCount = correctKeywords.filter((keyword: string) => userKeywords.includes(keyword)).length
          if (matchCount >= correctKeywords.length * 0.6) {
            score += question.points
          }
        }
      } else {
        if (userAnswer === question.correctAnswer) {
          score += question.points
        }
      }
    })
    return score
  }

  const submitQuiz = () => {
    setIsSubmitted(true)
    setShowResults(true)
    const score = calculateScore()
    const percentage = Math.round((score / totalPoints) * 100)

    // Mark as complete if passing score (70% or higher)
    if (percentage >= 70) {
      onComplete()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const renderQuestion = (question: Question) => {
    const userAnswer = answers[question.id]

    switch (question.type) {
      case "multiple-choice":
      case "true-false":
        return (
          <RadioGroup
            value={userAnswer || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            disabled={isSubmitted}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
                {isSubmitted && (
                  <div className="ml-2">
                    {option === question.correctAnswer ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : userAnswer === option ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>
        )

      case "multiple-select":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={Array.isArray(userAnswer) ? userAnswer.includes(option) : false}
                  onCheckedChange={(checked) => {
                    const currentAnswers = Array.isArray(userAnswer) ? userAnswer : []
                    if (checked) {
                      handleAnswerChange(question.id, [...currentAnswers, option])
                    } else {
                      handleAnswerChange(
                        question.id,
                        currentAnswers.filter((a) => a !== option),
                      )
                    }
                  }}
                  disabled={isSubmitted}
                />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
                {isSubmitted && (
                  <div className="ml-2">
                    {Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : Array.isArray(userAnswer) && userAnswer.includes(option) ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )

      case "short-answer":
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Type your answer here..."
              value={userAnswer || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              disabled={isSubmitted}
              className="min-h-[100px]"
            />
            {isSubmitted && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Sample Answer:</p>
                <p className="text-sm text-blue-700">{question.correctAnswer}</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / totalPoints) * 100)
    const passed = percentage >= 70

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <Trophy className="h-5 w-5 text-yellow-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
            Quiz Results
          </CardTitle>
          <CardDescription>Your performance on this quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">{percentage}%</div>
            <div className="text-muted-foreground">
              {score} out of {totalPoints} points
            </div>
            <Badge variant={passed ? "default" : "destructive"} className="text-sm">
              {passed ? "Passed" : "Failed"}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Score</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          {/* Question Review */}
          <div className="space-y-4">
            <h4 className="font-medium">Question Review</h4>
            {questions.map((question, index) => {
              const userAnswer = answers[question.id]
              const isCorrect =
                question.type === "multiple-select"
                  ? Array.isArray(question.correctAnswer) &&
                  Array.isArray(userAnswer) &&
                  question.correctAnswer.length === userAnswer.length &&
                  question.correctAnswer.every((ans) => userAnswer.includes(ans))
                  : userAnswer === question.correctAnswer

              return (
                <Card
                  key={question.id}
                  className={cn("border-l-4", isCorrect ? "border-l-green-500" : "border-l-red-500")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-2">
                          Question {index + 1}: {question.question}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">{question.explanation}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {question.points} points
                          </Badge>
                          <Badge variant={isCorrect ? "default" : "destructive"} className="text-xs">
                            {isCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!passed && (
              <Button
                onClick={() => {
                  setCurrentQuestion(0)
                  setAnswers({})
                  setShowResults(false)
                  setIsSubmitted(false)
                  setFlaggedQuestions(new Set())
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
            )}
            <Button variant="outline">Review Answers</Button>
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
              <FileText className="h-5 w-5 text-green-500" />
              {quiz.title}
            </CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={timeRemaining <= 60 ? "bg-red-100 text-red-700" : ""}>
  <Clock className="h-3 w-3 mr-1" />
  {formatTime(timeRemaining)}
</Badge>

            <Badge variant="outline">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} />
        </div>

        {/* Question */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">Question {currentQuestion + 1}</h3>
              <p className="text-muted-foreground mb-4">{currentQuestionData.question}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFlag(currentQuestionData.id)}
                className={flaggedQuestions.has(currentQuestionData.id) ? "text-orange-500" : ""}
              >
                <Flag className="h-4 w-4" />
              </Button>
              <Badge variant="outline">{currentQuestionData.points} points</Badge>
            </div>
          </div>

          {renderQuestion(currentQuestionData)}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestion ? "default" : "outline"}
                size="sm"
                className={cn(
                  "w-8 h-8 p-0",
                  answers[questions[index].id] && index !== currentQuestion && "bg-green-100 border-green-300",
                  flaggedQuestions.has(questions[index].id) && "bg-orange-100 border-orange-300",
                )}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <Button onClick={submitQuiz}>Submit Quiz</Button>
          ) : (
            <Button onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
