import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

// Los logos son ilustraciones estáticas: se rechazan enlaces, scripts, CSS,
// entidades y recursos externos. Nunca se inserta SVG como HTML en la página.
const tags = new Set(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'title', 'desc']);
const attributes = new Set(['xmlns', 'viewBox', 'width', 'height', 'id', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'fill-rule', 'clip-rule', 'opacity', 'fill-opacity', 'stroke-opacity', 'd', 'points', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'transform', 'gradientTransform', 'gradientUnits', 'offset', 'stop-color', 'stop-opacity', 'clip-path', 'mask', 'maskUnits', 'maskContentUnits', 'clipPathUnits', 'preserveAspectRatio', 'version', 'fx', 'fy', 'spreadMethod']);

export function validateLogoSvg(source: string): string {
  const invalid = () => new Error('SVG no compatible. Exporta un logo estático con textos convertidos a trazados, sin CSS, enlaces ni imágenes incrustadas.');
  if (!source || Buffer.byteLength(source) > 262144 || /<!DOCTYPE|<!ENTITY|<\?(?!xml\s)/i.test(source)) throw invalid();
  const document = new DOMParser({ onError: () => { throw invalid(); } }).parseFromString(source, 'image/svg+xml');
  const root = document.documentElement;
  if (!root || root.tagName !== 'svg' || root.namespaceURI !== 'http://www.w3.org/2000/svg') throw invalid();
  const viewBox = root.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
  if (!viewBox || viewBox.length !== 4 || viewBox.some((n) => !Number.isFinite(n)) || viewBox[2] <= 0 || viewBox[3] <= 0) {
    throw new Error('El SVG necesita viewBox válido. Recomendado: viewBox="0 0 128 128".');
  }
  for (const element of Array.from(document.getElementsByTagName('*'))) {
    if (!tags.has(element.tagName) || element.namespaceURI !== root.namespaceURI) throw invalid();
    for (const attribute of Array.from(element.attributes)) {
      if (!attributes.has(attribute.name)) throw invalid();
      const value = attribute.value;
      if (attribute.name === 'xmlns') {
        if (value !== 'http://www.w3.org/2000/svg') throw invalid();
      } else if (/url\(/i.test(value)) {
        if (!/^url\(#[a-zA-Z_][\w.-]*\)$/.test(value)) throw invalid();
      } else if (/[<>&\\]|javascript:|data:|https?:|\/\//i.test(value)) throw invalid();
    }
  }
  return new XMLSerializer().serializeToString(root);
}
