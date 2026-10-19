# TEV.docx Template Setup Guide

This guide explains how to manually add docxtemplater placeholder tags to `TEV.docx`
so the system can auto-populate the table with PSIR report data.

> **Why manual?** Microsoft Word internally splits text into multiple XML "runs", which
> breaks automated find-and-replace on the raw XML. Typing the tags directly in Word is
> the only reliable way to ensure they are stored as a single unbroken XML run.

---

## Before You Start

- Close the file in Word if it is currently open
- Make a backup: copy `TEV.docx` to `TEV.backup.docx` before editing
- Use **Microsoft Word** (not LibreOffice or Google Docs — they may alter the XML)

---

## Step 1 — Open and Prepare the Table

1. Open `templates/TEV.docx` in Microsoft Word
2. You will see a table with these 7 column headers:
   - INVESTIGATION DOCKET NO.
   - NAME OF PETITIONER
   - ADDRESS OF PETITIONER
   - DATE SO ORDERED
   - DATE RECEIVED BY ASSIGNED INVESTIGATING OFFICER
   - TYPE OF REPORT
   - DATE SUBMITTED TO COURT/REQUESTING OFFICER
3. Below the header row there are currently **3 empty data rows**
4. **Delete 2 of them** — leave only ONE empty data row. You will add tags to this row.

---

## Step 2 — Add Tags to the Data Row

Click inside each cell of the single remaining empty row and type exactly as shown.
Do NOT copy-paste from this document if your clipboard might add extra formatting —
type the tags manually character by character.

| Cell | What to type |
|------|-------------|
| Column 1 — INVESTIGATION DOCKET NO. | `{#rows}{Docket_No}` |
| Column 2 — NAME OF PETITIONER | `{Petitioner_Name}` |
| Column 3 — ADDRESS OF PETITIONER | `{Address}` |
| Column 4 — DATE SO ORDERED | `{Date_Ordered}` |
| Column 5 — DATE RECEIVED BY OFFICER | `{Date_Received}` |
| Column 6 — TYPE OF REPORT | `{Report_Type}` |
| Column 7 — DATE SUBMITTED TO COURT | `{Date_Submitted}{/rows}` |

### Critical Rules
- `{#rows}` must be at the **very start** of column 1's cell text
- `{/rows}` must be at the **very end** of column 7's cell text
- Do **not** add a space or line break before `{#rows}` or after `{/rows}`
- All tags must be in the **same row** — this tells docxtemplater to repeat that row
- Do **not** split a tag across two lines (e.g., `{Docket_` on one line, `No}` on another)

---

## Step 3 — Replace Hardcoded Names in the Header

At the top of the document, find:

```
NAME: FAITH KIRSTIE T. YAM
OFFICE: Tagbilaran City Parole and Probation Office
```

Replace the hardcoded values:

| Find this (select and delete it) | Type this instead |
|----------------------------------|-------------------|
| `FAITH KIRSTIE T. YAM` (in the NAME: line) | `{Officer_Name}` |
| `Tagbilaran City Parole and Probation Office` | `{Office_Name}` |

---

## Step 4 — Replace Hardcoded Names in the Footer

Below the table, find the signature block:

```
VERIFIED BY:                     CERTIFIED CORRECT BY:

CIRILO R. MARAMBA, JR.           FAITH KIRSTIE T. YAM
Chief Probation and Parole Officer    Investigating Officer
```

Replace:

| Find this | Type this instead |
|-----------|-------------------|
| `CIRILO R. MARAMBA, JR.` | `{Verified_By_Name}` |
| `Chief Probation and Parole Officer` | `{Verified_By_Title}` |
| `FAITH KIRSTIE T. YAM` (in the footer — the second occurrence) | `{Certified_By_Name}` |
| `Investigating Officer` | `{Certified_By_Title}` |

---

## Step 5 — Verify the Tags Look Correct

Your table's data row should now look like this when you read it left to right:

```
{#rows}{Docket_No} | {Petitioner_Name} | {Address} | {Date_Ordered} | {Date_Received} | {Report_Type} | {Date_Submitted}{/rows}
```

And the top of the document:
```
NAME: {Officer_Name}
OFFICE: {Office_Name}
```

---

## Step 6 — Save and Overwrite

1. Press **Ctrl+S** to save
2. When asked about format, keep it as **Word Document (.docx)**
3. The file must be saved at: `C:\Users\New\Documents\capitol\psir\templates\TEV.docx`
   (overwrite the original)

---

## Step 7 — Test the Export

1. Start the app: `pnpm dev`
2. Go to the Dashboard
3. Click the export button and select a month/year that has reports
4. Click **Export TEV**
5. Open the downloaded file — each report should appear as its own row

---

## Troubleshooting

### The table shows `{#rows}{Docket_No}` literally (tags not replaced)
- The tags were split across multiple XML runs by Word
- Solution: select the entire tag text (e.g. `{#rows}{Docket_No}`), delete it, and retype it manually in one go without clicking away mid-tag

### The table shows only 1 row no matter how many reports exist
- `{#rows}` and `{/rows}` are not in the same `<w:tr>` XML row
- Solution: make sure both tags are in the **same row** in the Word table — `{#rows}` in column 1 and `{/rows}` in column 7 of the SAME row

### Names in header/footer are still hardcoded
- Word split the name text across runs
- Solution: select the entire name, delete it completely, then type the placeholder tag fresh

### How to check if a tag got split (advanced)
1. Save the file
2. Rename a copy to `.zip`, open it, navigate to `word/document.xml`
3. Search for `Docket` — if you see something like `<w:t>Docket</w:t>...<w:t>_No}</w:t>` the tag is split
4. Fix: go back to Word, select and delete the tag, retype it

---

## Tag Reference (complete list)

| Placeholder | Value |
|-------------|-------|
| `{Officer_Name}` | Name of the investigating officer (header) |
| `{Office_Name}` | Name of the office |
| `{Verified_By_Name}` | Name in "VERIFIED BY" block |
| `{Verified_By_Title}` | Title in "VERIFIED BY" block |
| `{Certified_By_Name}` | Name in "CERTIFIED CORRECT BY" block |
| `{Certified_By_Title}` | Title in "CERTIFIED CORRECT BY" block |
| `{#rows}` | Start of table row loop (in column 1) |
| `{Docket_No}` | Investigation docket number |
| `{Petitioner_Name}` | Full name (LAST, First Middle) |
| `{Address}` | Present address or permanent address |
| `{Date_Ordered}` | Date court issued the order |
| `{Date_Received}` | Date received / report created date |
| `{Report_Type}` | Always "PSIR" |
| `{Date_Submitted}` | Date submitted to court (preparedBy date) |
| `{/rows}` | End of table row loop (in column 7) |
