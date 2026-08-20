interface WordPart {
  text: string
  emphasis: boolean
}

interface WordPartsProps {
  parts: WordPart[]
}

export function WordParts({ parts }: WordPartsProps) {
  return (
    <span className="word-parts">
      {parts.map((part, index) => (
        <span
          key={`${part.text}-${index}`}
          className={part.emphasis ? 'word-part emphasized-part' : 'word-part'}
        >
          {part.text}
        </span>
      ))}
    </span>
  )
}

