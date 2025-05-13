import katex from 'katex';

export default function latexToDataUrl(latex: string): string {
  try {
    // Render to HTML, then convert to SVG using DOMParser
    const html = katex.renderToString(latex, { output: 'html', throwOnError: false });
    // Create a temporary DOM element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const mathSpan = tempDiv.querySelector('.katex');
    if (!mathSpan) return '';
    // Create SVG wrapper
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '40');
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('width', '100%');
    foreignObject.setAttribute('height', '100%');
    foreignObject.appendChild(mathSpan);
    svg.appendChild(foreignObject);
    // Serialize SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const encoded = encodeURIComponent(svgString)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  } catch (e) {
    return '';
  }
} 