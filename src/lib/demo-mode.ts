// Real, working replacement for the dead NEXT_PUBLIC_DEMO_MODE claim.
//
// When false (the production default — the env var is unset), the localStorage
// demo/sample seeders are no-ops, so live admin and portal pages are not
// repopulated with fabricated users, families, employees, or food data.
//
// Set NEXT_PUBLIC_SEED_DEMO_DATA=true only in a throwaway/demo environment.
export function isDemoSeedEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SEED_DEMO_DATA === 'true';
}
