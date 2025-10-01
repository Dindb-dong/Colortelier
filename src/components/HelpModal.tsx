import { useMemo } from 'react'
export default function HelpModal({ title, content, onClose }: { title: string, content: string, onClose: () => void }) {
  // content contains html tags
  const parsedContent = useMemo(() => {
    return content.replace(/<code>(.*?)<\/code>/g, '<code>$1</code>')
  }, [content])
  return (
    <div className="help-modal">
      <div className="help-modal-content">

        <h2>{title}</h2>
        <div dangerouslySetInnerHTML={{ __html: parsedContent }}></div>
        <button className="primary button-cta" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}