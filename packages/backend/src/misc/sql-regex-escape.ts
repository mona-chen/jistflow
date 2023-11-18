export function sqlRegexEscape(s: string) {
	return s.replace(/([!$()*+.:<=>?[\\\]^{|}-])/g, "\\$1");
}
