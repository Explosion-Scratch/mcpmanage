export function parseJSON(content: string): any {
  const lines = content.split('\n');
  const cleanedLines: string[] = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('//')) {
      continue;
    }
    
    const commentIndex = line.indexOf('//');
    if (commentIndex !== -1) {
      const beforeComment = line.substring(0, commentIndex);
      const inString = isInsideString(beforeComment);
      
      if (!inString) {
        cleanedLines.push(beforeComment);
        continue;
      }
    }
    
    cleanedLines.push(line);
  }
  
  let cleanedContent = cleanedLines.join('\n');
  
  cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');
  
  return JSON.parse(cleanedContent);
}

function isInsideString(text: string): boolean {
  let inString = false;
  let escapeNext = false;
  let quoteChar = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      quoteChar = char;
    } else if (char === quoteChar && inString) {
      inString = false;
      quoteChar = '';
    }
  }
  
  return inString;
}

export function stringifyJSON(data: any, space: number = 2): string {
  return JSON.stringify(data, null, space);
}

