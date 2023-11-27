export async function copyToClipboard(val: string) {
	await navigator.clipboard.writeText(val);
}

export default copyToClipboard;
