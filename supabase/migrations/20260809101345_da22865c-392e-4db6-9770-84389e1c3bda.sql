CREATE OR REPLACE VIEW public.prospect_stage_history_details AS
SELECT 
    psh.id,
    psh.prospect_id,
    psh.from_stage_id,
    psh.to_stage_id,
    psh.note,
    psh.changed_by,
    psh.changed_at,
    p.contact_name as prospect_name,
    p.business_name as prospect_business,
    fs.name as from_stage_name,
    ts.name as to_stage_name,
    pr.full_name as changer_name,
    pr.email as changer_email
FROM public.prospect_stage_history psh
JOIN public.prospects p ON psh.prospect_id = p.id
LEFT JOIN public.stages fs ON psh.from_stage_id = fs.id
JOIN public.stages ts ON psh.to_stage_id = ts.id
LEFT JOIN public.profiles pr ON psh.changed_by = pr.id;

GRANT SELECT ON public.prospect_stage_history_details TO authenticated;
GRANT ALL ON public.prospect_stage_history_details TO service_role;