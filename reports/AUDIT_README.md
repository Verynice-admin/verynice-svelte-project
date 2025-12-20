# Firebase Database Audit Tool

Automated audit script for checking Firebase Firestore database correctness, consistency, and quality.

## Quick Start

```bash
# Run audit (basic)
npm run audit:firebase

# Run audit with verbose output
npm run audit:firebase:verbose

# Audit specific collection
node scripts/audit-firebase.js --collection pages

# Save report to custom file
node scripts/audit-firebase.js --output my-report.json
```

## What It Checks

### ✅ Data Quality
- Missing required fields (title, content, etc.)
- Invalid data types
- Empty or too short content
- Missing order fields

### ✅ Content Format
- **HTML Storage Issues**: Detects HTML-formatted content and calculates storage overhead
- **Format Consistency**: Checks if contentFormat matches actual content
- **Markdown Migration**: Recommends migrating from HTML to Markdown

### ✅ Security
- Script tags in content
- Event handlers (onclick, etc.)
- JavaScript URLs
- XSS vulnerabilities

### ✅ Images
- Missing publicId/URL
- Missing alt text (accessibility)
- Invalid image objects

### ✅ Structure
- Missing section IDs
- Invalid order values
- Nested collection consistency

## Output

The script generates:
1. **Console Output**: Real-time audit progress with color-coded issues
2. **JSON Report**: Detailed `audit-report.json` file with full results

### Report Structure

```json
{
  "timestamp": "2025-12-01T15:23:56.813Z",
  "projectId": "verynice-kz",
  "collections": [
    {
      "collection": "pages/historyPage/sections",
      "totalDocuments": 9,
      "documents": [
        {
          "id": "section-golden-man",
          "path": "pages/historyPage/sections/section-golden-man",
          "issues": [],
          "warnings": [
            "Using HTML format (101 tags, ~39.6% overhead). Consider migrating to Markdown for better storage efficiency."
          ],
          "info": [],
          "hasIssues": false,
          "hasWarnings": true,
          "contentFormat": "auto",
          "hasContentHTML": true,
          "hasContentMarkdown": false
        }
      ],
      "summary": {
        "totalIssues": 0,
        "totalWarnings": 8,
        "documentsWithIssues": 0,
        "documentsWithWarnings": 8
      }
    }
  ],
  "summary": {
    "totalCollections": 3,
    "totalDocuments": 14,
    "totalIssues": 0,
    "totalWarnings": 8,
    "documentsWithIssues": 0,
    "documentsWithWarnings": 8
  }
}
```

## Exit Codes

- `0`: Audit completed successfully (may have warnings)
- `1`: Audit failed or critical issues found

## Current Audit Results

Based on the latest audit:

### ✅ Good News
- **0 critical issues** found
- All documents have required fields
- No security vulnerabilities detected
- Data structure is consistent

### ⚠️ Recommendations
- **8 sections** using HTML format with 30-60% storage overhead
- Consider migrating to Markdown format (see `MARKDOWN_MIGRATION_GUIDE.md`)

### Storage Optimization Potential

If all HTML content is migrated to Markdown:
- **Estimated storage reduction**: 30-40%
- **Better searchability**: Plain text is easier to query
- **Easier maintenance**: Human-readable format

## Integration

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/audit.yml
- name: Audit Firebase Database
  run: npm run audit:firebase
```

### Scheduled Audits

Set up a cron job to run audits regularly:

```bash
# Run audit weekly
0 0 * * 0 cd /path/to/project && npm run audit:firebase
```

## Customization

Edit `scripts/audit-firebase.js` to:
- Add custom validation rules
- Check additional collections
- Modify warning thresholds
- Add custom checks

## Troubleshooting

### "Firebase service account not found"
- Place `serviceAccountKey.json` in `.secrets/` directory
- Or set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### "Permission denied"
- Ensure service account has Firestore read permissions
- Check Firebase project permissions

### Empty results
- Verify collection names match your database structure
- Check Firebase project ID is correct

## Related Documentation

- `MARKDOWN_MIGRATION_GUIDE.md` - Guide for migrating HTML to Markdown
- `ARTICLE_QUALITY_IMPLEMENTATION.md` - Content quality standards








