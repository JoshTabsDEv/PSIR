import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';

export interface RenderOptions {
  /** Path to template file relative to project root. Default: 'templates/PSIR.docx' */
  templatePath?: string;
  /** If true, throws on unresolved tags. Default: false (replaces with empty string) */
  strictMode?: boolean;
}

/**
 * Renders a PSIR DOCX document using docxtemplater.
 *
 * @param templateData - Flat object with template placeholders as keys
 * @param options - Render options
 * @returns Buffer containing the rendered DOCX
 *
 * @example
 * const data = buildTemplateData(report);
 * const buffer = renderPSIRDocx(data);
 */
export function renderPSIRDocx(
  templateData: Record<string, unknown>,
  options: RenderOptions = {}
): Buffer {
  const {
    templatePath = 'templates/PSIR.docx',
    strictMode = false,
  } = options;

  // Resolve template path - works both locally and on Vercel
  // process.cwd() points to project root in both environments
  const fullPath = path.join(process.cwd(), templatePath);

  // Check if template exists
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `Template not found at: ${fullPath}\n` +
      `Ensure the template is committed to the repo and not in .gitignore.\n` +
      `On Vercel, the file must be in the deployment bundle.`
    );
  }

  // Read template file
  const templateBuffer = fs.readFileSync(fullPath);

  // Load template into PizZip
  let zip: InstanceType<typeof PizZip>;
  try {
    zip = new PizZip(templateBuffer);
  } catch (err) {
    throw new Error(
      `Failed to parse DOCX template. Ensure it is a valid .docx file.\n` +
      `Original error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // Create docxtemplater instance with custom parser for safe defaults
  const doc = new Docxtemplater(zip, {
    // Paragraph loop - handles {#items}...{/items} blocks
    paragraphLoop: true,
    // Line breaks - preserves newlines in multi-line text
    linebreaks: true,
    // Custom parser for null/undefined handling
    parser: (tag: string) => {
      return {
        get: (scope: Record<string, unknown>) => {
          const value = scope[tag];
          // Return empty string for null/undefined
          if (value === null || value === undefined) {
            return '';
          }
          return value;
        },
      };
    },
    // Error handling
    nullGetter: () => {
      // Return empty string for missing tags (unless strictMode)
      return '';
    },
  });

  // Set template data
  doc.setData(templateData);

  // Render the document
  try {
    doc.render();
  } catch (err) {
    // Handle template errors with helpful messages
    if (err instanceof Error && 'properties' in err) {
      const templateError = err as Error & { properties?: { errors?: Array<{ properties?: { tag?: string } }> } };
      const errors = templateError.properties?.errors;

      if (errors && errors.length > 0) {
        const unresolvedTags = errors
          .filter((e) => e.properties?.tag)
          .map((e) => e.properties?.tag)
          .join(', ');

        if (strictMode) {
          throw new Error(
            `Template rendering failed. Unresolved tags: ${unresolvedTags}\n` +
            `Check that your templateData object includes all required fields.`
          );
        }

        // Log warning but continue with empty values
        console.warn(`[DOCX] Warning: Unresolved tags will be empty: ${unresolvedTags}`);
      }
    }

    // Re-throw if it's a different kind of error
    if (strictMode) {
      throw err;
    }

    // Try rendering again (docxtemplater caches the error, need fresh instance)
    const doc2 = new Docxtemplater(new PizZip(templateBuffer), {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
    });
    doc2.setData(templateData);
    doc2.render();
    return Buffer.from(doc2.getZip().generate({ type: 'nodebuffer' }));
  }

  // Generate output buffer
  const outputBuffer = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return Buffer.from(outputBuffer);
}

/**
 * Validates that all expected tags are present in templateData.
 * Useful for debugging template issues.
 */
export function validateTemplateData(
  templateData: Record<string, unknown>,
  expectedTags: string[]
): { missing: string[]; extra: string[] } {
  const dataKeys = Object.keys(templateData);
  const missing = expectedTags.filter((tag) => !(tag in templateData));
  const extra = dataKeys.filter((key) => !expectedTags.includes(key));
  return { missing, extra };
}
