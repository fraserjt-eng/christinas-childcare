# Secure Hosting Options for Christina's Child Care Center

## Overview

This document outlines secure cloud hosting options for storing sensitive data related to children, families, and staff. When handling childcare data, compliance with federal regulations is mandatory.

---

## Compliance Requirements

### Required Certifications

| Regulation | What It Covers | Required? |
|------------|----------------|-----------|
| **HIPAA** | Health info (medications, allergies, immunizations, medical conditions) | Yes |
| **FERPA** | Educational records, developmental assessments | Yes |
| **SOC 2 Type II** | Security controls, audit trails | Yes |
| **COPPA** | Children's online privacy (if collecting data from kids directly) | Maybe |

### Key Security Features Needed

- [ ] Data encryption at rest (AES-256)
- [ ] Data encryption in transit (TLS 1.2+)
- [ ] Signed Business Associate Agreement (BAA)
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Data residency controls (US-based servers)
- [ ] Automatic backups with encryption
- [ ] Two-factor authentication (2FA)

---

## Current Setup

| Component | Provider | HIPAA Compliant? |
|-----------|----------|------------------|
| Frontend Hosting | Vercel | No |
| Database | TBD | TBD |
| Authentication | TBD | TBD |
| File Storage | TBD | TBD |

**Status:** Not yet compliant for sensitive data storage.

---

## Hosting Options Comparison

### Option 1: Supabase Team/Enterprise (Recommended for Simplicity)

**Best for:** All-in-one solution with minimal DevOps

| Feature | Details |
|---------|---------|
| **Cost** | $599/month (Team) or custom (Enterprise) |
| **Compliance** | SOC 2 Type II, HIPAA with BAA |
| **Includes** | Database, Auth, Storage, Edge Functions |
| **Pros** | Easy to use, great DX, real-time features |
| **Cons** | Higher cost for small orgs |

**What you get:**
- PostgreSQL database with row-level security
- Built-in authentication
- File storage for documents/photos
- Signed BAA available

**Action:** Contact sales@supabase.io for BAA


### Option 2: Vercel + AWS Backend (Most Flexible)

**Best for:** Keeping current frontend, adding compliant backend

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel Pro | $20/month |
| Database | AWS RDS (PostgreSQL) | ~$50-100/month |
| Auth | AWS Cognito | ~$5-20/month |
| Storage | AWS S3 | ~$10-30/month |
| **Total** | | **~$85-170/month** |

**Pros:**
- Keep existing Vercel deployment
- Full HIPAA compliance with AWS BAA
- Most scalable option
- Pay only for what you use

**Cons:**
- More complex to set up
- Requires AWS expertise
- Multiple services to manage

**Action:** Enable AWS HIPAA account, sign BAA in AWS Artifact


### Option 3: Railway Enterprise

**Best for:** Vercel-like simplicity with HIPAA compliance

| Feature | Details |
|---------|---------|
| **Cost** | Custom pricing (contact sales) |
| **Compliance** | SOC 2, HIPAA with BAA |
| **Includes** | App hosting, PostgreSQL, Redis |
| **Pros** | Simple deployment, good DX |
| **Cons** | Enterprise pricing required for HIPAA |

**Action:** Contact Railway sales for enterprise quote


### Option 4: Google Cloud Platform (GCP)

**Best for:** Organizations already using Google Workspace

| Component | Service | Cost |
|-----------|---------|------|
| App Hosting | Cloud Run | ~$20-50/month |
| Database | Cloud SQL | ~$50-100/month |
| Auth | Firebase Auth | Free-$25/month |
| Storage | Cloud Storage | ~$10-20/month |
| **Total** | | **~$80-195/month** |

**Pros:**
- HIPAA, FERPA, SOC 2 compliant
- Good Firebase integration
- Strong identity management

**Cons:**
- Learning curve
- Can get expensive at scale

**Action:** Sign BAA via Google Cloud Console


### Option 5: Microsoft Azure

**Best for:** Organizations using Microsoft 365

| Component | Service | Cost |
|-----------|---------|------|
| App Hosting | Azure App Service | ~$50-100/month |
| Database | Azure SQL | ~$50-150/month |
| Auth | Azure AD B2C | ~$0-50/month |
| Storage | Azure Blob | ~$10-20/month |
| **Total** | | **~$110-320/month** |

**Pros:**
- Full compliance suite
- Integrates with M365/Teams
- Strong enterprise features

**Cons:**
- More expensive
- Complex pricing
- Steeper learning curve

**Action:** Sign BAA in Azure Trust Center

---

## Cost Summary

| Option | Monthly Cost | Setup Complexity | HIPAA Ready |
|--------|--------------|------------------|-------------|
| Supabase Team | $599 | Low | Yes (with BAA) |
| Vercel + AWS | $85-170 | High | Yes (with BAA) |
| Railway Enterprise | Custom | Low | Yes (with BAA) |
| Google Cloud | $80-195 | Medium | Yes (with BAA) |
| Microsoft Azure | $110-320 | Medium-High | Yes (with BAA) |

---

## Recommended Path Forward

### Phase 1: Immediate (Current State)
- Keep Vercel for public-facing website
- **Do NOT store sensitive data yet**
- Use the app for demo/planning purposes only

### Phase 2: Pre-Launch (Before Collecting Real Data)
1. Choose a compliant backend (recommend **Supabase Team** or **AWS**)
2. Sign BAA with chosen provider
3. Implement proper authentication
4. Set up encrypted database
5. Configure audit logging
6. Create data retention policies

### Phase 3: Production
- Migrate to compliant infrastructure
- Staff training on data handling
- Regular security audits
- Incident response plan

---

## Sensitive Data Categories

### What Requires HIPAA Protection

- Child medical records
- Immunization records
- Allergy information
- Medication logs
- Incident/injury reports
- Health screening results

### What Requires FERPA Protection

- Developmental assessments
- Progress reports
- Behavioral observations
- IEP/special needs documentation

### What Requires General Protection

- Parent/guardian contact info
- Emergency contacts
- Financial/billing information
- Staff personnel records
- Background check results

---

## Questions to Answer Before Choosing

1. **Budget:** What's the monthly infrastructure budget?
2. **Technical Resources:** Do we have DevOps expertise or need managed services?
3. **Timeline:** When do we need to go live with real data?
4. **Scale:** How many families/children will use the system?
5. **Integration:** Do we need to integrate with other systems (payroll, state reporting)?

---

## Next Steps

- [ ] Determine budget for infrastructure
- [ ] Decide on complexity tolerance (managed vs. self-hosted)
- [ ] Contact preferred provider for BAA
- [ ] Plan data migration strategy
- [ ] Develop privacy policy and data handling procedures
- [ ] Train staff on compliance requirements

---

## Resources

- [HIPAA for Childcare Providers](https://www.hhs.gov/hipaa/for-professionals/faq/index.html)
- [FERPA Overview](https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html)
- [Supabase HIPAA Info](https://supabase.com/docs/guides/platform/hipaa)
- [AWS HIPAA Compliance](https://aws.amazon.com/compliance/hipaa-compliance/)
- [Google Cloud HIPAA](https://cloud.google.com/security/compliance/hipaa)

---

*Last Updated: January 2026*
*Document Owner: Christina's Child Care Center IT*
