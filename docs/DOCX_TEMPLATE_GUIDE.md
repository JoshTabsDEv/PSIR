# DOCX Template Guide (Latest)

This file reflects the latest data produced by:

- `psir/lib/docx/buildTemplateData.ts`

Use this as the source of truth for DOCX placeholders in `templates/PSIR.docx`.

## Syntax

- Single value: `{Tag_Name}`
- Loop: `{#Array_Tag}...{/Array_Tag}`
- Conditional: `{#Condition_Tag}...{/Condition_Tag}`

## Latest Tags

### Metadata

- `{Report_Number}`
- `{Status}`
- `{Created_Date}`
- `{Updated_Date}`

### Section I: Identifying Data

- `{Last_Name}`
- `{First_Name}`
- `{Middle_Name}`
- `{True_Name}`
- `{Full_Name}`
- `{Alias}`
- `{Sex}`
- `{Sex_Male}`
- `{Sex_Female}`
- `{Birthday}`
- `{Birthday_Short}`
- `{Birthplace}`
- `{Nationality}`
- `{Religion}`
- `{Civil_Status}`
- `{Age}`
- `{Educational_Attainment}`
- `{Occupation}`
- `{Spouse_Name}`
- `{Spouse_Address}` (currently empty)
- `{Identifying_Marks}`
- `{Present_Address}`
- `{Permanent_Address}`
- `{Letter_Judge}`
- `{Letter_Court}`
- `{Letter_Position}`
- `{Letter_Address}`
- `{Investigation_Docket_Number}`
- `{Criminal_Case_Number}`

### Section II: Criminal History (Latest Schema)

#### Present Offense

- `{Charged_With}`
- `{Charged_Date}`
- `{Convicted_Of}`
- `{Convicted_Date}`
- `{Sentence}`
- `{Court}` (mirrors `{Letter_Court}`)
- `{Address_At_Arrest}`

#### Custodial Status

- `{Custodial_Status}`
- `{Custodial_On_Bail}`
- `{Custodial_On_Detention}`
- `{Custodial_ROR}`
- `{ROR_Custodian}`

#### Prior Records (NBI/CMRD/Others)

- `{NBI_Case_Number}`
- `{NBI_Offense}`
- `{NBI_Date_Charged}`
- `{NBI_Decision_Status}`
- `{CMRD_Case_Number}`
- `{CMRD_Offense}`
- `{CMRD_Date_Charged}`
- `{CMRD_Decision_Status}`
- `{Others_Case_Number}`
- `{Others_Offense}`
- `{Others_Date_Charged}`
- `{Others_Decision_Status}`

#### Previous Convictions Loop

- `{Has_Previous_Convictions}`
- `{No_Previous_Convictions}`
- `{Previous_Convictions_Count}`
- `{#Previous_Convictions}...{/Previous_Convictions}`

Loop fields:

- `{Index}`
- `{Offense}`
- `{Case_Number}`
- `{Date}`
- `{Court}` (currently empty)
- `{Sentence}`

### Section III: Socio-Economic Background

- `{Family_Economic_Status}`
- `{Status_Poor}`
- `{Status_Low_Income}`
- `{Status_Low_Middle}`
- `{Status_Middle_Middle}`
- `{Status_Upper_Middle}`
- `{Status_Upper_Income}`
- `{Status_Rich}`
- `{Family_Relationship}`
- `{Relationship_Very_Satisfactory}`
- `{Relationship_Satisfactory}`
- `{Relationship_Poor}`
- `{Family_Reputation}`
- `{Reputation_Very_Satisfactory}`
- `{Reputation_Satisfactory}`
- `{Reputation_Poor}`
- `{Family_Support}`
- `{Support_Very_Satisfactory}`
- `{Support_Satisfactory}`
- `{Support_Poor}`
- `{Community_Acceptability}`
- `{Community_Very_Satisfactory}`
- `{Community_Satisfactory}`
- `{Community_Poor}`
- `{Overall_Well_Being}`
- `{WellBeing_Very_Satisfactory}`
- `{WellBeing_Satisfactory}`
- `{WellBeing_Poor}`

### Section IV: Analysis and Evaluation

- `{Circumstances}`
- `{Needs}`
- `{Attitude}`
- `{Recommendations}`
- `{Community_Service_Hours}`
- `{Community_Service_Type}`
- `{Prepared_By_Name}`
- `{Prepared_By_Designation}`
- `{Prepared_By_Date}`
- `{Reviewed_By_Name}`
- `{Reviewed_By_Designation}`
- `{Reviewed_By_Date}`

## Legacy Compatibility Tags

These are still generated for old templates:

- `{Agency}` (same as `{Court}`)
- `{Case_Number}` (top-level legacy tag is currently empty)
- `{Criminal_Case_Nos}` (currently empty)
- `{Offense}` (same as `{Charged_With}`)
- `{Offense_Character}` (same as `{Convicted_Of}`)
- `{Date_Of_Crime}` (same as `{Charged_Date}`)
- `{Date_Of_Arrest}` (same as `{Convicted_Date}`)
- `{Status_Of_Case}` (same as `{Custodial_Status}`)
- `{Status_On_Trial}` (currently always unchecked)
- `{Status_On_Detention}` (same behavior as `{Custodial_On_Detention}`)
- `{Judge}` (legacy only, currently empty)

## Loop Example

```text
{#Previous_Convictions}
{Index}. {Offense} - Case No. {Case_Number}
Date: {Date}
Disposition: {Sentence}
{/Previous_Convictions}
```

## Condition Example

```text
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

## Checkbox Symbols

- Checked: `☑` (`\u2611`)
- Unchecked: `☐` (`\u2610`)

## Notes

- Empty or null fields render as empty string.
- Missing checkboxes render unchecked.
- If tags are not replaced, verify exact case and ensure Word did not split the tag into multiple formatting runs.
