import{t as e}from"./mysql-api-CP7zkbnP.js";import{t}from"./queryOptions-kFkK3IOB.js";async function n(t={}){try{let n=await e(`SELECT 
        o.id AS opportunity_id,
        o.id AS id,
        p.id AS prospect_id,
        p.contact_name AS client_name,
        p.business_name,
        COALESCE(p.designation, 'Managing Director') AS client_designation,
        p.phone,
        p.email,
        o.estimated_value AS sale_amount,
        o.assigned_to AS assigned_agent_id,
        COALESCE(u_assign.name, 'Agent') AS assigned_agent_name,
        o.created_by AS created_by_id,
        COALESCE(u_create.name, 'Admin') AS created_by_name,
        COALESCE(i.invoice_number, CONCAT('INV-2026-', SUBSTRING(o.id, 1, 4))) AS billing_invoice_id,
        COALESCE(o.notes, 'Sales Closed agreement.') AS notes,
        o.updated_at AS won_at,
        o.created_at,
        o.updated_at
      FROM \`opportunities\` o
      JOIN \`prospects\` p ON o.prospect_id = p.id
      LEFT JOIN \`users\` u_assign ON o.assigned_to = u_assign.id
      LEFT JOIN \`users\` u_create ON o.created_by = u_create.id
      LEFT JOIN \`invoices\` i ON p.id = i.prospect_id
      WHERE (o.status = 'Sales Won' OR o.status = 'Won' OR LOWER(o.status) LIKE '%won%')
        AND o.is_active = 1
      ORDER BY o.updated_at DESC;`);return!n.success||!Array.isArray(n.data)?[]:r(n.data.map(e=>({id:String(e.id),opportunity_id:String(e.opportunity_id),prospect_id:String(e.prospect_id||``),client_name:String(e.client_name||`Client`),business_name:e.business_name||void 0,client_designation:String(e.client_designation||`Managing Director`),phone:String(e.phone||``),email:String(e.email||``),sale_amount:Number(e.sale_amount||0),assigned_agent_id:e.assigned_agent_id||null,assigned_agent_name:String(e.assigned_agent_name||`Agent`),created_by_id:e.created_by_id||null,created_by_name:String(e.created_by_name||`Admin`),billing_invoice_id:String(e.billing_invoice_id||`INV-2026-001`),notes:String(e.notes||``),won_at:String(e.won_at||new Date().toISOString()),created_at:String(e.created_at||new Date().toISOString()),updated_at:String(e.updated_at||new Date().toISOString())})),t)}catch(e){return console.warn(`fetchWonSales MySQL error:`,e),[]}}function r(e,t){let n=e;if(t.agent_id&&t.agent_id!==`all`&&(n=n.filter(e=>e.assigned_agent_id===t.agent_id)),t.from_date){let e=t.from_date;n=n.filter(t=>t.won_at.split(`T`)[0]>=e)}if(t.to_date){let e=t.to_date;n=n.filter(t=>t.won_at.split(`T`)[0]<=e)}if(t.search&&t.search.trim()!==``){let e=t.search.toLowerCase().trim();n=n.filter(t=>t.client_name.toLowerCase().includes(e)||t.business_name&&t.business_name.toLowerCase().includes(e)||t.client_designation.toLowerCase().includes(e)||t.phone.includes(e)||t.email.toLowerCase().includes(e)||t.assigned_agent_name.toLowerCase().includes(e)||t.created_by_name.toLowerCase().includes(e)||t.billing_invoice_id.toLowerCase().includes(e)||t.notes.toLowerCase().includes(e))}return n}async function i(){try{let t=await e("SELECT id, name FROM `users` WHERE is_active = 1 ORDER BY name ASC;");return!t.success||!Array.isArray(t.data)?[]:t.data.map(e=>({id:String(e.id),name:String(e.name||`Agent`)}))}catch(e){return console.warn(`fetchAgentOptions MySQL error:`,e),[]}}var a=(e={})=>t({queryKey:[`won-sales`,e],queryFn:()=>n(e)}),o=()=>t({queryKey:[`agents`,`options`],queryFn:()=>i()});export{a as n,o as t};