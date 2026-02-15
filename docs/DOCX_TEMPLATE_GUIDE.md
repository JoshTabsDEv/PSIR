# DOCX Template Tags Guide

This guide explains how to use template tags in the `templates/PSIR.docx` file for document generation.

## Overview

The system uses **docxtemplater** to replace placeholders in your Word template with actual data. Placeholders use curly braces: `{Tag_Name}`.

## Template Setup

### File Location
Place your template at: `templates/PSIR.docx`

### Basic Syntax

| Syntax | Description | Example |
|--------|-------------|---------|
| `{Tag_Name}` | Simple text replacement | `{Last_Name}` → "Dela Cruz" |
| `{#Array}...{/Array}` | Loop through items | See [Loops](#loops) |
| `{#Condition}...{/Condition}` | Conditional section | See [Conditionals](#conditionals) |

---

## Avoiding Word Formatting Issues

Word often splits text into invisible "runs" which can break tags. For example, `{Last_Name}` might become `{Last_` + `Name}` internally.

### How to Fix

1. **Type in Notepad first** - Write the tag in Notepad, then paste into Word
2. **Clear formatting** - Select the tag and press `Ctrl+Space`
3. **Use Find/Replace** - Standardize all formatting at once

---

## Available Tags

### Report Metadata

| Tag | Description | Example Output |
|-----|-------------|----------------|
| `{Report_Number}` | Unique report ID | "PSIR-2025-00001" |
| `{Status}` | Report status | "draft" or "completed" |
| `{Created_Date}` | Creation date | "February 14, 2025" |
| `{Updated_Date}` | Last modified date | "February 14, 2025" |

---

### Section I: Identifying Data

#### Personal Information

| Tag | Description |
|-----|-------------|
| `{Last_Name}` | Offender's last name |
| `{First_Name}` | Offender's first name |
| `{Middle_Name}` | Offender's middle name |
| `{Full_Name}` | Combined: "LAST NAME, First Name Middle Name" |
| `{Alias}` | Known aliases |
| `{Birthday}` | Birth date (full format) |
| `{Birthday_Short}` | Birth date (MM/DD/YYYY) |
| `{Birthplace}` | Place of birth |
| `{Age}` | Current age |
| `{Nationality}` | Nationality |
| `{Religion}` | Religion |
| `{Civil_Status}` | Marital status |
| `{Educational_Attainment}` | Education level |
| `{Occupation}` | Occupation |
| `{Identifying_Marks}` | Physical marks/tattoos |
| `{Permanent_Address}` | Home address |

#### Sex (with Checkboxes)

| Tag | Description | Output |
|-----|-------------|--------|
| `{Sex}` | Text value | "Male" or "Female" |
| `{Sex_Male}` | Checkbox for Male | ☑ or ☐ |
| `{Sex_Female}` | Checkbox for Female | ☑ or ☐ |

#### Spouse Information

| Tag | Description |
|-----|-------------|
| `{Spouse_Name}` | Spouse's full name |
| `{Spouse_Address}` | Spouse's address |

---

### Section II: Criminal History

#### Present Offense

| Tag | Description |
|-----|-------------|
| `{Agency}` | Handling agency/court |
| `{Case_Number}` | Criminal case number |
| `{Criminal_Case_Nos}` | Alias for case number |
| `{Offense}` | Nature of offense |
| `{Offense_Character}` | Character of offense |
| `{Date_Of_Crime}` | When crime was committed |
| `{Date_Of_Arrest}` | When arrested |
| `{Address_At_Arrest}` | Address when arrested |

#### Case Status (with Checkboxes)

| Tag | Description | Output |
|-----|-------------|--------|
| `{Status_Of_Case}` | Text value | "On trial" or "On detention" |
| `{Status_On_Trial}` | Checkbox | ☑ or ☐ |
| `{Status_On_Detention}` | Checkbox | ☑ or ☐ |

#### Previous Convictions

| Tag | Description |
|-----|-------------|
| `{Has_Previous_Convictions}` | Checkbox if has priors | ☑ or ☐ |
| `{No_Previous_Convictions}` | Checkbox if no priors | ☑ or ☐ |
| `{Previous_Convictions_Count}` | Number of previous convictions |

**Loop Example:**
```
{#Previous_Convictions}
{Index}. {Offense} - Case No. {Case_Number}
    Court: {Court}
    Date: {Date}
    Sentence: {Sentence}
{/Previous_Convictions}
```

Tags available inside the loop:
- `{Index}` - Row number (1, 2, 3...)
- `{Offense}` - Previous offense
- `{Case_Number}` - Case number
- `{Date}` - Date of conviction
- `{Court}` - Court name
- `{Sentence}` - Sentence given

---

### Section III: Drug and Violence History

| Tag | Description |
|-----|-------------|
| `{Age_Of_First_Use}` | Age when first used drugs |
| `{Frequency_Of_Use}` | How often drugs are used |
| `{Drug_Type}` | Type of drug used |
| `{Last_Use_Date}` | Date of last drug use |
| `{Is_User_Dealer_Both}` | Text: "User", "Dealer", or "Both" |

#### User/Dealer Checkboxes

| Tag | Description | Output |
|-----|-------------|--------|
| `{Is_User}` | Checkbox for User | ☑ or ☐ |
| `{Is_Dealer}` | Checkbox for Dealer | ☑ or ☐ |
| `{Is_Both}` | Checkbox for Both | ☑ or ☐ |
| `{Not_Applicable}` | Checkbox for N/A | ☑ or ☐ |

---

### Section IV: Socio-Economic Background

#### Family Composition

| Tag | Description |
|-----|-------------|
| `{Family_Type}` | "Nuclear" or "Extended" |
| `{Family_Type_Nuclear}` | Checkbox | ☑ or ☐ |
| `{Family_Type_Extended}` | Checkbox | ☑ or ☐ |
| `{Living_With}` | Who the offender lives with |
| `{Children_Count}` | Number of children |
| `{Siblings_Older}` | Number of older siblings |
| `{Siblings_Younger}` | Number of younger siblings |

#### Family History

| Tag | Description |
|-----|-------------|
| `{Parents_Status}` | Parents' marital status |
| `{Parents_Relationship}` | Relationship with parents |
| `{Parents_Criminal_History}` | Parents' criminal record |
| `{Siblings_Criminal_History}` | Siblings' criminal record |

#### Family Support

| Tag | Description |
|-----|-------------|
| `{Visit_Frequency}` | How often family visits |
| `{Will_Provide_Housing}` | Checkbox: will house after release | ☑ or ☐ |
| `{Will_Not_Provide_Housing}` | Checkbox: won't house | ☑ or ☐ |
| `{Support_Description}` | Description of family support |

#### Community

| Tag | Description |
|-----|-------------|
| `{Community_Acceptability}` | "Acceptable" or "Not Acceptable" |
| `{Community_Acceptable}` | Checkbox | ☑ or ☐ |
| `{Community_Not_Acceptable}` | Checkbox | ☑ or ☐ |
| `{Community_Remarks}` | Additional community notes |

#### Residential & Well-being

| Tag | Description |
|-----|-------------|
| `{Place_Of_Stay}` | Where offender resided |
| `{Residential_Stability}` | Stability of residence |
| `{Health_Status}` | Current health condition |
| `{Family_Relations}` | Family relationship status |

---

### Section V: Analysis and Evaluation

| Tag | Description |
|-----|-------------|
| `{Circumstances}` | Circumstances of offense |
| `{Needs}` | Identified needs |
| `{Attitude}` | Offender's attitude |
| `{Recommendations}` | Recommendations |

#### Signatures

**Prepared By:**

| Tag | Description |
|-----|-------------|
| `{Prepared_By_Name}` | Name of preparer |
| `{Prepared_By_Designation}` | Title/position |
| `{Prepared_By_Date}` | Date prepared |

**Reviewed By:**

| Tag | Description |
|-----|-------------|
| `{Reviewed_By_Name}` | Name of reviewer |
| `{Reviewed_By_Designation}` | Title/position |
| `{Reviewed_By_Date}` | Date reviewed |

---

## Loops

Use loops to repeat sections for arrays of data.

### Syntax

```
{#Array_Name}
  Content to repeat with {Field_Name} placeholders
{/Array_Name}
```

### Example: Previous Convictions Table

```
| No. | Offense | Case No. | Court | Date | Sentence |
|-----|---------|----------|-------|------|----------|
{#Previous_Convictions}
| {Index} | {Offense} | {Case_Number} | {Court} | {Date} | {Sentence} |
{/Previous_Convictions}
```

---

## Conditionals

Show or hide content based on conditions.

### Syntax

```
{#Condition_Tag}
  This content only shows if Condition_Tag is truthy
{/Condition_Tag}
```

### Example: Show Previous Convictions Only If They Exist

```
{#Has_Previous_Convictions}
PREVIOUS CONVICTIONS:
{#Previous_Convictions}
- {Offense} ({Case_Number})
{/Previous_Convictions}
{/Has_Previous_Convictions}

{#No_Previous_Convictions}
No previous convictions on record.
{/No_Previous_Convictions}
```

---

## Checkboxes

Checkbox tags output Unicode symbols:
- **Checked:** ☑ (`\u2611`)
- **Unchecked:** ☐ (`\u2610`)

### Example Usage in Template

```
Sex:  {Sex_Male} Male    {Sex_Female} Female

Status:  {Status_On_Trial} On Trial    {Status_On_Detention} On Detention

User/Dealer:  {Is_User} User  {Is_Dealer} Dealer  {Is_Both} Both  {Not_Applicable} N/A
```

---

## Empty Values

When a field has no data:
- Text fields return empty string `""`
- Checkboxes return ☐ (unchecked)
- Dates return empty string `""`

The template will gracefully handle missing data without showing "undefined" or "null".

---

## Quick Reference: All Tags

```
// Metadata
{Report_Number} {Status} {Created_Date} {Updated_Date}

// Section I - Identifying Data
{Last_Name} {First_Name} {Middle_Name} {Full_Name} {Alias}
{Sex} {Sex_Male} {Sex_Female}
{Birthday} {Birthday_Short} {Birthplace} {Nationality} {Religion}
{Civil_Status} {Age} {Educational_Attainment} {Occupation}
{Spouse_Name} {Spouse_Address}
{Identifying_Marks} {Permanent_Address}

// Section II - Criminal History
{Agency} {Case_Number} {Criminal_Case_Nos} {Offense} {Offense_Character}
{Date_Of_Crime} {Date_Of_Arrest}
{Status_Of_Case} {Status_On_Trial} {Status_On_Detention}
{Address_At_Arrest}
{Has_Previous_Convictions} {No_Previous_Convictions} {Previous_Convictions_Count}
{#Previous_Convictions} {Index} {Offense} {Case_Number} {Date} {Court} {Sentence} {/Previous_Convictions}

// Section III - Drug/Violence
{Age_Of_First_Use} {Frequency_Of_Use} {Drug_Type} {Last_Use_Date}
{Is_User_Dealer_Both} {Is_User} {Is_Dealer} {Is_Both} {Not_Applicable}

// Section IV - Socio-Economic
{Family_Type} {Family_Type_Nuclear} {Family_Type_Extended}
{Living_With} {Children_Count} {Siblings_Older} {Siblings_Younger}
{Parents_Status} {Parents_Relationship} {Parents_Criminal_History} {Siblings_Criminal_History}
{Visit_Frequency} {Will_Provide_Housing} {Will_Not_Provide_Housing} {Support_Description}
{Community_Acceptability} {Community_Acceptable} {Community_Not_Acceptable} {Community_Remarks}
{Place_Of_Stay} {Residential_Stability}
{Health_Status} {Family_Relations}

// Section V - Analysis
{Circumstances} {Needs} {Attitude} {Recommendations}
{Prepared_By_Name} {Prepared_By_Designation} {Prepared_By_Date}
{Reviewed_By_Name} {Reviewed_By_Designation} {Reviewed_By_Date}
```

---

## Troubleshooting

### Tag Not Replaced

1. Check for Word "runs" splitting the tag - clear formatting
2. Verify exact tag name (case-sensitive)
3. Check console for "Unresolved tags" warning

### Checkbox Shows Wrong Symbol

1. Ensure the data value exactly matches expected value
2. Example: `Sex` must be exactly "Male" or "Female", not "male" or "M"

### Loop Not Working

1. Ensure opening `{#Tag}` and closing `{/Tag}` match exactly
2. Check that the array has data
3. Tags inside loop must match field names in `buildTemplateData.ts`

---

## Adding New Tags

To add a new tag:

1. Add the field to `buildTemplateData.ts`:
   ```typescript
   New_Tag_Name: str(report.someField),
   ```

2. Add to `getAllTemplateTags()` array for validation

3. Use `{New_Tag_Name}` in your Word template
