const process = require('node:process')

const CURRENT_PATH = './'
// eslint-disable-next-line no-template-curly-in-string
const VERSION_TEMPLATE = '${version}'
const PKG_NAME = process.env.npm_package_name

module.exports = {
	plugins: {
		'@release-it/conventional-changelog': {
			path: CURRENT_PATH,
			preset: 'unjs',
			infile: 'CHANGELOG.md',
			header: '# Changelog\n\nAll notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.\n',
			gitRawCommitsOpts: {
				path: CURRENT_PATH,
			},
		},
	},
	git: {
		push: false,
		tagName: `${PKG_NAME}@${VERSION_TEMPLATE}`,
		commitsPath: CURRENT_PATH,
		commitMessage: `chore(release): ${PKG_NAME} v${VERSION_TEMPLATE}`,
	},
	github: {
		release: false,
	},
	npm: {
		publish: false,
	},
}
