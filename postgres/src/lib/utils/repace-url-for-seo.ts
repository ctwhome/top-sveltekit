// Usage: replaceURL(inputString, category)
// Description: Replace the url of the image with the url of the category
export const replaceURL = (inputString: string, category: string) => {
	const regex = /(https:\/\/portfolio\.ctwhome\.com\/)(?!wp-content)/g;
	return (
		inputString
			.replace(regex, (_match) => 'https://ctwhome.com/') // replace the url
			.replace(/content="noindex/g, 'content="index') // replace noindex with index
			// remove htnl comments
			.replace(/<!--(.*?)-->/g, '')
	);
};
