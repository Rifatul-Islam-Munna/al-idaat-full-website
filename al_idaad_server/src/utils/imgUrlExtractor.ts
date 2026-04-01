export const extractImageSources = (html: string): string[] => {
    // Create a regular expression to match all img tags and capture the src attribute
    const imgSrcRegex = /<img[^>]+src=["'](.*?)["']/g;
    const sources: string[] = [];

    // Find all matches and extract the src values
    let match: RegExpExecArray | null;
    while ((match = imgSrcRegex.exec(html)) !== null) {
        if (match[1]) {
            sources.push(match[1]);
        }
    }

    return sources;
};
