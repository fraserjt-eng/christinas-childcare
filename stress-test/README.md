# Stress Test Suite: Christina's Child Care Center

## Setup

```bash
pip install stressor
```

## Test Profiles

**Full Suite (15 concurrent users):**
- 1 Admin (Christina): dashboard, attendance, families, scheduling, reports
- 3 Employees: clock in, meal counts, photos, tasks, schedule
- 5 Parents: dashboard, photos, messages, calendar, children
- 5 Public visitors: homepage, programs, enrollment, tour scheduling
- 1 Kiosk: rapid check-in/check-out

**Spike Test (30 concurrent users):**
Simulates 8:00-8:30 AM morning drop-off rush with all roles active simultaneously.

## Running

### Against local dev server
```bash
# Terminal 1: Start the dev server
cd /path/to/christinas-childcare
npm run dev

# Terminal 2: Run full suite
stressor run stress-test/scenario.yaml --monitor

# Terminal 3: Run spike test
stressor run stress-test/spike-scenario.yaml --monitor
```

### Against production (Vercel)
Edit `base_url` in scenario.yaml to `https://christinas-childcare.vercel.app`
Reduce session count to 5 (Vercel free tier has concurrency limits).

```bash
stressor run stress-test/scenario.yaml --monitor
```

### Debug mode (single session)
```bash
stressor run stress-test/scenario.yaml --single --verbose 3
```

## What to look for

1. **Response times**: All pages under 2s local, under 3s production
2. **First failure**: Which endpoint breaks first under load?
3. **Rate limiting**: Do enrollment/tour APIs correctly return 429 after 5/min?
4. **Edge cases**: Do 404s, empty forms, XSS attempts fail gracefully?
5. **Morning rush**: Can the system handle 30 simultaneous users during drop-off?

## Pass criteria

| Metric | Target |
|--------|--------|
| Public page p95 | < 2.0s |
| Portal page p95 | < 3.0s |
| API p95 | < 3.0s |
| Error rate | < 1% |
| Spike survival | No 500s, all pages load |
