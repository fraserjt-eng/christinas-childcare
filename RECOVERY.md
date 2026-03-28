# Emergency Recovery: Christina's Child Care Center

This document is your "break glass" guide. Keep a printed copy in the filing cabinet.

## If the website is down

1. Check Vercel status at https://www.vercel-status.com
2. Check Supabase status at https://status.supabase.com
3. If both are up and the site is still down, contact your developer or use Claude Code:
   ```
   cd "/Users/jfraser/Desktop/Desktop Winter 26 - Drive/09_Childcare-Business/Christina's Child Care Center/christinas-childcare"
   vercel --prod
   ```

## If data is missing from the admin dashboard

**Step 1: Try the in-app restore**
1. Go to https://christinas-childcare.vercel.app/admin/settings/backup
2. Find the most recent snapshot (green checkmark = good)
3. Click "Restore" and confirm
4. Refresh the page. Your data should be back.

**Step 2: If snapshots are empty, check Supabase**
1. Go to https://supabase.com/dashboard/project/dkzxcxwjhhxqfgksynjb
2. Click "Database" in the sidebar
3. Check if tables have data (enrollment_inquiries, food_counts, employees, etc.)
4. If tables have data but the site doesn't show it, the issue is localStorage. The snapshot restore (Step 1) should fix it.

**Step 3: If Supabase tables are empty, use the CSV backup**
1. Find the most recent `christinas-backup-YYYY-MM-DD.csv` file (from the weekly download)
2. Give this file to your developer with this prompt:

```
Read RECOVERY.md and the attached CSV backup file. Restore all data to the
Supabase project dkzxcxwjhhxqfgksynjb. The CSV has sections marked with
### headers. Each section maps to a localStorage key. Parse each section
and insert into the matching Supabase table. Map the keys as follows:

christinas_food_counts -> food_counts table
christinas_employees -> employees table
christinas_incidents -> incident_reports table
christinas_pipeline_leads -> enrollment_inquiries table
christinas_tours -> tour_requests table
christinas_time_entries -> (localStorage only, restore to localStorage)

For all other christinas_* keys, write them back to localStorage using
a script that runs in the browser console.
```

## Project details

| Item | Value |
|------|-------|
| Live URL | https://christinas-childcare.vercel.app |
| Supabase project | dkzxcxwjhhxqfgksynjb |
| Supabase dashboard | https://supabase.com/dashboard/project/dkzxcxwjhhxqfgksynjb |
| Vercel project | christinas-childcare |
| GitHub | https://github.com/fraserjt-eng/christinas-childcare |
| Local path | /Users/jfraser/Desktop/Desktop Winter 26 - Drive/09_Childcare-Business/Christina's Child Care Center/christinas-childcare/ |

## Weekly backup schedule

- **Monday morning:** Create snapshot in /admin/settings/backup. Download CSV.
- **Friday evening:** Create snapshot. Download CSV. File the printed copy.

## Cost warnings

- Do NOT enable Supabase Point-in-Time Recovery (PITR). It costs $100/month and is not needed. Standard daily backups are included free.
- Do NOT add Vercel Cron Jobs. They increase function execution costs.
- The current setup costs: Supabase Pro ($25/mo) + Vercel Pro ($20/mo) = $45/mo total. No usage-based charges should appear unless traffic exceeds 100,000 page views/month.

## Contacts

- Platform developer: [your developer contact]
- Supabase support: support@supabase.io
- Vercel support: https://vercel.com/support
