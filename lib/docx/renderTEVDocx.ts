import type { TEVTemplateData } from './buildTEVData';
import { renderPSIRDocx } from './renderPSIRDocx';

/**
 * Renders the TEV DOCX template.
 * The template at templates/TEV.docx must already contain docxtemplater
 * placeholder tags as described in templates/TEV-TEMPLATE-GUIDE.md.
 */
export function renderTEVDocx(data: TEVTemplateData): Buffer {
  return renderPSIRDocx(data as unknown as Record<string, unknown>, {
    templatePath: 'templates/TEV.docx',
  });
}

