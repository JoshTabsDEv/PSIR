/**
 * DOCX Template Rendering Module
 *
 * Uses docxtemplater + pizzip to render PSIR reports using a Word template.
 *
 * ## Template Setup
 *
 * 1. Place template at: templates/PSIR.docx
 * 2. Convert placeholders from «Tag» to {Tag} format
 * 3. Use plain text placeholders (avoid Word's "smart" formatting)
 *
 * ## Avoiding Word "Runs" Issues
 *
 * Word splits text into "runs" which can break placeholders like {Tag_Name}
 * into {Tag_ + Name}. To fix:
 *
 * 1. Type placeholder in Notepad first, then paste into Word
 * 2. Or select placeholder text → Clear Formatting (Ctrl+Space)
 * 3. Or use Find/Replace to standardize formatting
 *
 * ## Template Syntax Reference
 *
 * - Simple value: {Tag_Name}
 * - Checkbox: {Checkbox_Tag} → outputs ☑ or ☐
 * - Loop: {#Array_Tag}...{/Array_Tag}
 * - Conditional: {#Condition}...{/Condition}
 *
 * @module lib/docx
 */

export { renderPSIRDocx, validateTemplateData } from './renderPSIRDocx';
export type { RenderOptions } from './renderPSIRDocx';

export { buildTemplateData, getAllTemplateTags } from './buildTemplateData';
