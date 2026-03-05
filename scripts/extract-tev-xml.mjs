/**
 * Utility script to extract and inspect TEV.docx XML structure.
 * Usage: node scripts/extract-tev-xml.mjs
 *
 * Outputs word/document.xml to scripts/tev-document.xml for debugging
 * the XML patching logic in lib/docx/renderTEVDocx.ts.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const PizZip = (await import('pizzip')).default;

const templatePath = path.join(projectRoot, 'templates/TEV.docx');
const buffer = fs.readFileSync(templatePath);
const zip = new PizZip(buffer);

const docXml = zip.file('word/document.xml').asText();

const outputPath = path.join(projectRoot, 'scripts/tev-document.xml');
fs.writeFileSync(outputPath, docXml);
console.log('Extracted to:', outputPath);
console.log('Length:', docXml.length, 'characters');
