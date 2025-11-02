import type { Preview } from '@storybook/react-vite'
import { Code } from './components/Code'

export default {
	parameters: {
		docs: {
			components: {
				code: Code
			}
		}
	}
} satisfies Preview
