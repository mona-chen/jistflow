/**
 * webpack configuration
 */

import I18nReplacer from '../src/common/build/i18n';
import { pattern as faPattern, replacement as faReplacement } from '../src/common/build/fa';
const constants = require('../src/const.json');

import plugins from './plugins';

import langs from '../locales';
import version from '../src/version';

global['faReplacement'] = faReplacement;

module.exports = Object.keys(langs).map(lang => {
	// Chunk name
	const name = lang;

	// Entries
	const entry = {
		desktop: './src/web/app/desktop/script.ts',
		//mobile: './src/web/app/mobile/script.ts',
		//ch: './src/web/app/ch/script.ts',
		//stats: './src/web/app/stats/script.ts',
		//status: './src/web/app/status/script.ts',
		//dev: './src/web/app/dev/script.ts',
		//auth: './src/web/app/auth/script.ts',
		sw: './src/web/app/sw.js'
	};

	const output = {
		path: __dirname + '/../built/web/assets',
		filename: `[name].${version}.${lang}.js`
	};

	const i18nReplacer = new I18nReplacer(lang);
	global['i18nReplacement'] = i18nReplacer.replacement;

	return {
		name,
		entry,
		module: {
			rules: [{
				test: /\.vue$/,
				exclude: /node_modules/,
				use: [{
					loader: 'vue-loader',
					options: {
						cssSourceMap: false,
						preserveWhitespace: false
					}
				}, {
					loader: 'webpack-replace-loader',
					options: {
						search: '$theme-color',
						replace: constants.themeColor,
						attr: 'g'
					}
				}, {
					loader: 'webpack-replace-loader',
					query: {
						search: '$theme-color-foreground',
						replace: constants.themeColorForeground,
						attr: 'g'
					}
				}, {
					loader: 'replace',
					query: {
						search: i18nReplacer.pattern.toString(),
						replace: 'i18nReplacement'
					}
				}, {
					loader: 'replace',
					query: {
						search: faPattern.toString(),
						replace: 'faReplacement'
					}
				}]
			}, {
				test: /\.styl$/,
				exclude: /node_modules/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
					{ loader: 'stylus-loader' }
				]
			}, {
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [{
					loader: 'ts-loader',
					options: {
						configFile: __dirname + '/../src/web/app/tsconfig.json',
						appendTsSuffixTo: [/\.vue$/]
					}
				}, {
					loader: 'replace',
					query: {
						search: i18nReplacer.pattern.toString(),
						replace: 'i18nReplacement'
					}
				}, {
					loader: 'replace',
					query: {
						search: faPattern.toString(),
						replace: 'faReplacement'
					}
				}]
			}]
		},
		plugins: plugins(version, lang),
		output,
		resolve: {
			extensions: [
				'.js', '.ts'
			]
		},
		resolveLoader: {
			modules: ['node_modules', './webpack/loaders']
		},
		cache: true
	};
});
