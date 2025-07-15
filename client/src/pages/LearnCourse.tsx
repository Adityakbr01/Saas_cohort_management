import LearningPortalClient from "@/components/LearnCourse/learning-portal"

interface PageProps {
  params: { cohortId: string }
}

export default function LearnCourse({ params }: PageProps) {
  return <LearningPortalClient cohortId={params.cohortId} />
}
