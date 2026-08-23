interface WordPart {
  text: string
  emphasis: boolean
}

interface WordPartsProps {
  parts: WordPart[]
}

export function WordParts({ parts }: WordPartsProps) {
  return (
    <span className="word-parts" aria-label="Highlighted word pattern">
      {parts.map((part, index) => (
        <span
          key={`${part.text}-${index}`}
          className={part.emphasis ? 'word-part emphasized-part' : 'word-part'}
          data-emphasis={part.emphasis ? 'true' : 'false'}
        >
          {part.text}
        </span>
      ))}
    </span>
  )
}
