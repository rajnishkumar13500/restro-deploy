export function extractPublicId(url: string): string | null {
    // Regular expression to capture the public ID
    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = url.match(regex);
  
    // If there's a match, return the captured group (the public ID)
    return match ? match[1] : null;
  }
  
