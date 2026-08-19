interface QuestionProgressProps {
  currentIndex: number
  total: number
}

export function QuestionProgress({ currentIndex, total }: QuestionProgressProps) {
  return (
    <p className="question-progress" aria-live="polite">
      Question {currentIndex + 1} of {total}
    </p>
  )
}
