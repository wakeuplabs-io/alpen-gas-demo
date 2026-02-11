import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
// @ts-ignore - mermaid types may not be available
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();
  
  // Determine the actual theme (handle 'system' theme)
  const currentTheme = resolvedTheme || theme || 'light';
  const mermaidTheme = currentTheme === 'dark' ? 'dark' : 'default';

  useEffect(() => {
    if (!ref.current) return;

    mermaid.initialize({
      startOnLoad: true,
      theme: mermaidTheme,
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });

    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    
    mermaid.render(id, chart).then((result: { svg: string }) => {
      if (ref.current) {
        ref.current.innerHTML = result.svg;
      }
    }).catch((error: Error) => {
      console.error('Error rendering Mermaid diagram:', error);
      if (ref.current) {
        ref.current.innerHTML = `<div class="text-destructive text-sm">Error rendering diagram: ${error.message}</div>`;
      }
    });
  }, [chart, mermaidTheme]);

  return (
    <div 
      ref={ref} 
      className="mermaid-diagram w-full overflow-x-auto flex justify-center py-4"
    />
  );
}
