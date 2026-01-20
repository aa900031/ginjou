import { Mermaid } from 'mdx-mermaid/lib/Mermaid'
import React from 'react'

export function Code({ className, children }: any): React.JSX.Element {
	if (className === 'language-mermaid') {
		return (
			<div className={className} style={{ margin: '20px 0 40px' }}>
				<Mermaid chart={children} />
			</div>
		)
	}

	return (
		<code className={className}>{children}</code>
	)
}
