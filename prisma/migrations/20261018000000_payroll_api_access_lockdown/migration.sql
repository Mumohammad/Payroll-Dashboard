-- Lock down only the application tables created by the payroll initial migration.
-- Access is intentionally through the authenticated Next.js server and its Prisma role;
-- anon/authenticated have no direct Data API policies or privileges on these tables.
REVOKE ALL PRIVILEGES ON TABLE
  public."PayrollRuleSet",
  public."PayrollRuleValue",
  public."ContractOverride",
  public."CompanyProfile",
  public."Driver",
  public."PayrollRun",
  public."DriverResult",
  public."PayrollException",
  public."TrafficViolation",
  public."ManualAdjustment",
  public."CustomBonus",
  public."CustomDeduction",
  public."AuditLog",
  public."IncomeRecord",
  public."ExpenseCategory",
  public."Expense",
  public."DriverCount",
  public."CustomIncomeField"
FROM PUBLIC, anon, authenticated;

ALTER TABLE public."PayrollRuleSet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PayrollRuleValue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ContractOverride" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CompanyProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Driver" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PayrollRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DriverResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PayrollException" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TrafficViolation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ManualAdjustment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CustomBonus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CustomDeduction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."IncomeRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ExpenseCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DriverCount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CustomIncomeField" ENABLE ROW LEVEL SECURITY;

-- Any future application table added to public must receive equivalent grants/RLS
-- protection in its migration. This migration deliberately does not alter unrelated tables.
