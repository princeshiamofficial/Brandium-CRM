-- Supabase PostgreSQL Migration for Module 16: Client Balances SQL Aggregation View
-- Purpose: Dynamic SQL aggregation for client balances calculation without manually saved balance fields
-- Formula: Current Balance = SUM(non-cancelled invoices) - SUM(valid payments)

CREATE OR REPLACE VIEW public.client_balances_view AS
SELECT 
  p.id AS client_id,
  COALESCE(p.contact_name, p.business_name, 'Unknown Client') AS name,
  p.business_name,
  p.phone,
  p.email,
  COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.total_amount ELSE 0.00 END), 0.00) AS total_billed,
  COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.paid_amount ELSE 0.00 END), 0.00) AS total_paid,
  GREATEST(0.00, 
    COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.total_amount ELSE 0.00 END), 0.00) - 
    COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.paid_amount ELSE 0.00 END), 0.00)
  ) AS current_balance,
  MAX(COALESCE(i.updated_at, p.updated_at)) AS last_updated
FROM public.prospects p
LEFT JOIN public.invoices i ON i.prospect_id = p.id
GROUP BY p.id, p.contact_name, p.business_name, p.phone, p.email;

-- Grant permissions for authenticated users
GRANT SELECT ON public.client_balances_view TO authenticated;
