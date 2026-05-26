import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Renderiza Markdown de forma segura (react-markdown não interpreta HTML por
 * padrão) com suporte a GFM (listas, tabelas, autolinks).
 */
export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none text-foreground/90 prose-pre:bg-background-secondary prose-pre:border prose-pre:border-subtle prose-code:text-primary-destaque prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-a:text-primary-destaque hover:prose-a:underline prose-headings:text-foreground prose-strong:text-foreground prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  )
}
