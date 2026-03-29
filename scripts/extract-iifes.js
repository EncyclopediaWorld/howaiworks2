const fs = require('fs');
const path = require('path');

const root = process.cwd();
const sectionsDir = path.join(root, 'content', 'sections');

function extractDemos(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const demos = [];
  
  // Find all comment headers and their corresponding IIFEs
  const headerRegex = /\/\/\s*=====\s*(.+?)\s*=====/g;
  let headerMatch;
  const headers = [];
  
  while ((headerMatch = headerRegex.exec(content)) !== null) {
    headers.push({
      name: headerMatch[1].trim(),
      index: headerMatch.index
    });
  }
  
  // For each header, find the next IIFE
  headers.forEach((header, i) => {
    const startPos = header.index;
    const nextHeaderPos = i+1 < headers.length ? headers[i+1].index : content.length;
    const section = content.substring(startPos, nextHeaderPos);
    
    // Find the IIFE in this section
    const iifeMatcher = /\(function\(\)\{[\s\S]*?\}\)\(\);/;
    const match = section.match(iifeMatcher);
    
    if (match) {
      demos.push({
        name: header.name,
        iife: match[0]
      });
    }
  });
  
  return { fileName, demos };
}

// Extract from all three files
const section6 = extractDemos(path.join(sectionsDir, 'section6.html'), 'section6');
const section7 = extractDemos(path.join(sectionsDir, 'section7.html'), 'section7');
const section8 = extractDemos(path.join(sectionsDir, 'section8.html'), 'section8');

// Output formatted JSON
const result = {
  section6: { demos: section6.demos },
  section7: { demos: section7.demos },
  section8: { demos: section8.demos }
};

console.log(JSON.stringify(result, null, 2));
