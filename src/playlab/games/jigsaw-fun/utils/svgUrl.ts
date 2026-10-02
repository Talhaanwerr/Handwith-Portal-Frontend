/**
 * An SVG drawing as a CSS image (`url("data:…")`), for a picture a stylesheet
 * has to paint — the shared ChoiceScreen's plates are text buttons, so the
 * puzzle games hand each plate its sample drawing through a custom property.
 * Only self-contained markup works here: an image inside it would not load.
 */
export function svgUrl(viewBox: string, body: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}'>${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
