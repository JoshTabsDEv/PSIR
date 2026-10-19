import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Minimal tag renderer for .xlsx templates.
 *
 * Any cell whose text contains `{Tag_Name}` is replaced with the value from
 * `data` (unknown tags become empty, like the DOCX renderer). Everything else
 * in the workbook (styles, merges, images, other sheets, print settings) is
 * left byte-for-byte untouched because we only rewrite the matched `<c>`
 * elements inside the worksheet XML.
 */

const TAG_RE = /\{([A-Za-z0-9_]+)\}/g;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

function renderSheet(xml: string, sharedStrings: string[], data: Record<string, string>): string {
  // Cells with content: <c r="A1" s="3" t="s"><v>12</v></c> or <c ... t="inlineStr"><is>...</is></c>
  // The (?<!\/) lookbehind skips self-closing empty cells (<c r="B2" s="1"/>), which would
  // otherwise swallow everything up to the next </c>.
  return xml.replace(/<c r="([A-Z]+\d+)"([^>]*?)(?<!\/)>([\s\S]*?)<\/c>/g, (whole, ref: string, attrs: string, inner: string) => {
    const type = (attrs.match(/\st="(\w+)"/) || [])[1];
    let text: string | undefined;

    if (type === 's') {
      const index = Number((inner.match(/<v>(\d+)<\/v>/) || [])[1]);
      text = sharedStrings[index];
    } else if (type === 'inlineStr') {
      text = textOf(inner);
    }

    if (text === undefined || !TAG_RE.test(text)) return whole;
    TAG_RE.lastIndex = 0;

    const rendered = text.replace(TAG_RE, (_, key: string) => data[key] ?? '');
    const style = (attrs.match(/\ss="\d+"/) || [''])[0];

    if (rendered === '') return `<c r="${ref}"${style}/>`;
    return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(rendered)}</t></is></c>`;
  });
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

  for (const name of Object.keys(zip.files)) {
    if (!/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) continue;
    zip.file(name, renderSheet(zip.file(name)!.asText(), sharedStrings, data));
  }

  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}
