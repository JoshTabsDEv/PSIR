import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Minimal tag renderer for .xlsx templates.
 *
 * 1. Any cell whose text contains `{Tag_Name}` is replaced with the value from
 *    `data` (unknown tags become empty, like the DOCX renderer).
 * 2. Formula cells that are plain references (`='Clients Profile'!C16`, `=B12`)
 *    get their cached result recomputed from the rendered cells, so dependent
 *    sheets show the right values even in Excel's Protected View or in viewers
 *    that never calculate. Other formulas lose their stale cached value and the
 *    workbook is flagged for full recalculation on open.
 *
 * Everything else (styles, merges, images, print settings) is left untouched
 * because only matched `<c>` elements inside the worksheet XML are rewritten.
 */

const TAG_RE = /\{([A-Za-z0-9_]+)\}/g;
const CELL_RE = /<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|(?<!\/)>([\s\S]*?)<\/c>)/g;
// 'Sheet Name'!A1 | Sheet!A1 | A1   (plain references only; $ anchors tolerated)
const REF_FORMULA_RE = /^(?:'((?:[^']|'')+)'!|([A-Za-z0-9_.]+)!)?\$?([A-Z]+)\$?(\d+)$/;

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function unescapeXml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Concatenate all <t> runs of a shared-string or inline-string item. */
function textOf(xmlFragment: string): string {
  return [...xmlFragment.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => unescapeXml(m[1])).join('');
}

function loadSharedStrings(zip: PizZip): string[] {
  const file = zip.file('xl/sharedStrings.xml');
  if (!file) return [];
  return [...file.asText().matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => textOf(m[1]));
}

/** Sheet name -> zip path, from workbook.xml + its rels. */
function loadSheetPaths(zip: PizZip): Map<string, string> {
  const workbook = zip.file('xl/workbook.xml')?.asText() ?? '';
  const rels = zip.file('xl/_rels/workbook.xml.rels')?.asText() ?? '';
  const targets = new Map(
    [...rels.matchAll(/<Relationship\b[^>]*\bId="([^"]+)"[^>]*\bTarget="([^"]+)"/g)].map((m) => [m[1], m[2]])
  );
  const paths = new Map<string, string>();
  for (const m of workbook.matchAll(/<sheet\b[^>]*\bname="([^"]+)"[^>]*\br:id="([^"]+)"/g)) {
    const target = targets.get(m[2]);
    if (!target) continue;
    const normalized = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
    paths.set(unescapeXml(m[1]), normalized);
  }
  return paths;
}

interface Cell {
  text: string;
  formula?: string;
}

/** Parse every cell of a sheet into text (and formula when present). */
function readCells(xml: string, sharedStrings: string[]): Map<string, Cell> {
  const cells = new Map<string, Cell>();
  for (const [, ref, attrs, inner = ''] of xml.matchAll(CELL_RE)) {
    const type = (attrs.match(/\st="(\w+)"/) || [])[1];
    const formula = (inner.match(/<f(?:\s[^>]*)?>([\s\S]*?)<\/f>/) || [])[1];
    const v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
    let text = '';
    if (type === 's') text = sharedStrings[Number(v)] ?? '';
    else if (type === 'inlineStr') text = textOf(inner);
    else if (v !== undefined) text = unescapeXml(v);
    cells.set(ref, { text, formula: formula ? unescapeXml(formula) : undefined });
  }
  return cells;
}

function renderTags(xml: string, sharedStrings: string[], data: Record<string, string>): string {
  return xml.replace(CELL_RE, (whole, ref: string, attrs: string, inner?: string) => {
    if (inner === undefined) return whole; // self-closing empty cell
    const type = (attrs.match(/\st="(\w+)"/) || [])[1];
    let text: string | undefined;
    if (type === 's') text = sharedStrings[Number((inner.match(/<v>(\d+)<\/v>/) || [])[1])];
    else if (type === 'inlineStr') text = textOf(inner);

    if (text === undefined || !TAG_RE.test(text)) return whole;
    TAG_RE.lastIndex = 0;

    const rendered = text.replace(TAG_RE, (_, key: string) => data[key] ?? '');
    const style = (attrs.match(/\ss="\d+"/) || [''])[0];
    if (rendered === '') return `<c r="${ref}"${style}/>`;
    return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(rendered)}</t></is></c>`;
  });
}

/** Resolve a plain-reference formula to its final text, following chains across sheets. */
function resolveReference(
  formula: string,
  currentSheet: string,
  book: Map<string, Map<string, Cell>>,
  seen = new Set<string>()
): string | undefined {
  const m = formula.trim().match(REF_FORMULA_RE);
  if (!m) return undefined;
  const sheet = m[1] ? m[1].replace(/''/g, "'") : m[2] || currentSheet;
  const ref = `${m[3]}${m[4]}`;
  const key = `${sheet}!${ref}`;
  if (seen.has(key)) return undefined; // cycle
  seen.add(key);

  const cell = book.get(sheet)?.get(ref);
  if (!cell) return '';
  if (cell.formula) return resolveReference(cell.formula, sheet, book, seen);
  return cell.text;
}

/** Rewrite formula cells: cached value recomputed for plain references, dropped otherwise. */
function refreshFormulaCells(xml: string, sheetName: string, book: Map<string, Map<string, Cell>>): string {
  return xml.replace(CELL_RE, (whole, ref: string, attrs: string, inner?: string) => {
    if (!inner || !/<f[\s>]/.test(inner)) return whole;
    const formulaXml = (inner.match(/<f(?:\s[^>]*)?>[\s\S]*?<\/f>|<f(?:\s[^>]*)?\/>/) || [''])[0];
    const formula = (inner.match(/<f(?:\s[^>]*)?>([\s\S]*?)<\/f>/) || [])[1];
    const style = (attrs.match(/\ss="\d+"/) || [''])[0];
    const resolved = formula ? resolveReference(unescapeXml(formula), sheetName, book) : undefined;

    if (resolved === undefined || resolved === '') {
      return `<c r="${ref}"${style}>${formulaXml}</c>`; // let Excel compute it
    }
    return `<c r="${ref}"${style} t="str">${formulaXml}<v>${escapeXml(resolved)}</v></c>`;
  });
}

/** Ask Excel to run a full calculation when the workbook is opened. */
function forceRecalcOnOpen(zip: PizZip): void {
  const file = zip.file('xl/workbook.xml');
  if (!file) return;
  let xml = file.asText();
  if (/<calcPr\b[^>]*fullCalcOnLoad=/.test(xml)) return;
  xml = /<calcPr\b/.test(xml)
    ? xml.replace(/<calcPr\b/, '<calcPr fullCalcOnLoad="1"')
    : xml.replace('</workbook>', '<calcPr fullCalcOnLoad="1"/></workbook>');
  zip.file('xl/workbook.xml', xml);
}

export interface RenderXlsxOptions {
  /** Path relative to the project root */
  templatePath: string;
}

export function renderXlsxTemplate(data: Record<string, string>, options: RenderXlsxOptions): Buffer {
  const fullPath = path.join(process.cwd(), options.templatePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Template not found at: ${fullPath}`);
  }

  const zip = new PizZip(fs.readFileSync(fullPath));
  const sharedStrings = loadSharedStrings(zip);
  const sheetPaths = loadSheetPaths(zip);

  // Pass 1: fill tags
  const rendered = new Map<string, string>();
  for (const [name, filePath] of sheetPaths) {
    const file = zip.file(filePath);
    if (file) rendered.set(name, renderTags(file.asText(), sharedStrings, data));
  }

  // Pass 2: recompute cached results of reference formulas from the filled cells
  const book = new Map<string, Map<string, Cell>>();
  for (const [name, xml] of rendered) book.set(name, readCells(xml, sharedStrings));
  for (const [name, xml] of rendered) {
    zip.file(sheetPaths.get(name)!, refreshFormulaCells(xml, name, book));
  }

  forceRecalcOnOpen(zip);

  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}
