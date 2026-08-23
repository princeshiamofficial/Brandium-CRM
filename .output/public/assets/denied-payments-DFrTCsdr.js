import{t as e}from"./mysql-api-C74RjZ50.js";import{t}from"./queryOptions-lNXbnasO.js";function n(){return typeof crypto<`u`&&typeof crypto.randomUUID==`function`?crypto.randomUUID():`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g,e=>{let t=Math.random()*16|0;return(e===`x`?t:t&3|8).toString(16)})}async function r(t={}){try{let n=await e(`SELECT 
        COALESCE(o.id, p.id) AS id,
        p.id AS prospect_id,
        p.contact_name AS prospect_name,
        p.business_name,
        COALESCE(o.assigned_to, p.assigned_to) AS agent_id,
        u.name AS agent_name,
        p.phone,
        COALESCE(s.name, 'Software License') AS service,
        COALESCE(o.notes, p.notes, 'Payment declined or disputed') AS denial_reason,
        'Client Accounts' AS denied_by,
        COALESCE(o.updated_at, p.updated_at) AS denied_at,
        COALESCE(o.estimated_value, SUM(i.total_amount), 0) AS amount,
        COALESCE(o.status, st.name, 'Denied Payment') AS current_stage,
        COALESCE(o.notes, p.notes) AS notes,
        p.created_at,
        COALESCE(o.updated_at, p.updated_at) AS updated_at
      FROM \`prospects\` p
      LEFT JOIN \`opportunities\` o ON p.id = o.prospect_id AND (LOWER(o.status) LIKE '%denied%' OR LOWER(o.status) LIKE '%lost%' OR LOWER(o.status) LIKE '%reject%')
      LEFT JOIN \`users\` u ON COALESCE(o.assigned_to, p.assigned_to) = u.id
      LEFT JOIN \`services\` s ON p.service_id = s.id
      LEFT JOIN \`stages\` st ON p.stage_id = st.id
      LEFT JOIN \`invoices\` i ON p.id = i.prospect_id
      WHERE (
        LOWER(COALESCE(o.status, '')) LIKE '%denied%' 
        OR LOWER(COALESCE(o.status, '')) LIKE '%lost%' 
        OR LOWER(COALESCE(o.status, '')) LIKE '%reject%'
        OR LOWER(COALESCE(st.name, '')) LIKE '%denied%' 
        OR LOWER(COALESCE(st.name, '')) LIKE '%lost%' 
        OR LOWER(COALESCE(st.name, '')) LIKE '%reject%'
      )
      AND p.is_active = 1
      GROUP BY p.id, o.id, p.contact_name, p.business_name, o.assigned_to, p.assigned_to, u.name, p.phone, s.name, o.notes, p.notes, o.updated_at, p.updated_at, o.status, st.name, p.created_at, o.estimated_value
      ORDER BY updated_at DESC;`);return!n.success||!Array.isArray(n.data)?[]:i(n.data.map(e=>({id:String(e.id),prospect_id:String(e.prospect_id||e.id),prospect_name:String(e.prospect_name||`Client`),business_name:e.business_name||void 0,agent_id:e.agent_id||null,agent_name:String(e.agent_name||`Agent`),phone:String(e.phone||``),service:String(e.service||`Software Services`),denial_reason:String(e.denial_reason||`Client requested review`),denied_by:String(e.denied_by||`Finance`),denied_at:String(e.denied_at||new Date().toISOString()),amount:Number(e.amount||0),current_stage:String(e.current_stage||`Denied Payment`),notes:e.notes||void 0,created_at:String(e.created_at||new Date().toISOString()),updated_at:String(e.updated_at||new Date().toISOString())})),t)}catch(e){return console.warn(`fetchDeniedPayments MySQL error:`,e),[]}}function i(e,t){let n=e;if(t.agent_id&&t.agent_id!==`all`&&(n=n.filter(e=>e.agent_id===t.agent_id)),t.current_stage&&t.current_stage!==`all`&&(n=n.filter(e=>e.current_stage===t.current_stage)),t.from_date&&(n=n.filter(e=>e.denied_at.substring(0,10)>=t.from_date)),t.to_date&&(n=n.filter(e=>e.denied_at.substring(0,10)<=t.to_date)),t.search&&t.search.trim()!==``){let e=t.search.toLowerCase().trim();n=n.filter(t=>t.prospect_name.toLowerCase().includes(e)||t.business_name&&t.business_name.toLowerCase().includes(e)||t.agent_name.toLowerCase().includes(e)||t.service.toLowerCase().includes(e)||t.denial_reason.toLowerCase().includes(e)||t.phone.includes(e))}return n}async function a(e){return(await r()).find(t=>t.id===e)||null}async function o(t){try{let n=await e(`SELECT 
        sh.id,
        sh.prospect_id,
        COALESCE(s_from.name, 'Previous Stage') AS from_stage_name,
        COALESCE(s_to.name, 'Current Stage') AS to_stage_name,
        sh.notes AS note,
        COALESCE(u.name, 'System Agent') AS changed_by_name,
        sh.created_at AS changed_at
      FROM \`prospect_stage_history\` sh
      LEFT JOIN \`stages\` s_from ON sh.from_stage_id = s_from.id
      LEFT JOIN \`stages\` s_to ON sh.to_stage_id = s_to.id
      LEFT JOIN \`users\` u ON sh.changed_by = u.id
      WHERE sh.prospect_id = ?
      ORDER BY sh.created_at DESC;`,[t]);if(n.success&&Array.isArray(n.data))return n.data.map(e=>({id:String(e.id),prospect_id:String(e.prospect_id),from_stage_name:String(e.from_stage_name),to_stage_name:String(e.to_stage_name),note:String(e.note||``),changed_by_name:String(e.changed_by_name),changed_at:String(e.changed_at||new Date().toISOString())}))}catch(e){console.warn(`fetchStageHistoryForProspect MySQL error:`,e)}return[]}async function s(t){let r=new Date().toISOString().slice(0,19).replace(`T`,` `),i=await e("SELECT `id` FROM `stages` WHERE LOWER(TRIM(`name`)) LIKE '%denied%' LIMIT 1;"),a=i?.success&&i.data?.[0]?String(i.data[0].id):`denied-payment`,o=null;try{let n=await e("SELECT `stage_id` FROM `prospects` WHERE `id` = ? LIMIT 1;",[t.prospectId]);n?.success&&n.data?.[0]&&(o=String(n.data[0].stage_id||``)||null)}catch{}await e("UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;",[a,r,t.prospectId]),await e("INSERT INTO `prospect_stage_history`\n       (`id`, `prospect_id`, `from_stage_id`, `to_stage_id`, `note`, `changed_at`)\n     VALUES (?, ?, ?, ?, ?, ?);",[n(),t.prospectId,o,a,`Denied by ${t.deniedBy}: ${t.denialReason}`,r]);try{await e("INSERT INTO `opportunities`\n         (`id`, `prospect_id`, `status`, `estimated_value`, `notes`, `assigned_to`, `created_at`, `updated_at`)\n       VALUES (?, ?, 'Denied Payment', ?, ?, ?, ?, ?);",[n(),t.prospectId,t.amount??0,t.denialReason+(t.notes?`\n${t.notes}`:``),t.agentId||null,r,r])}catch(e){console.warn(`Opportunity record notice (denied payment):`,e)}}async function c(t){let r=new Date().toISOString().slice(0,19).replace(`T`,` `),i=t.prospectId||t.deniedPaymentId,o=(await e("SELECT id, name FROM `stages` WHERE LOWER(name) LIKE LOWER(?) LIMIT 1;",[`%${t.newStage}%`]))?.data?.[0]?.id;if(i){o&&await e("UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;",[o,r,i]);try{await e("UPDATE `opportunities` SET `status` = ?, `updated_at` = ? WHERE `prospect_id` = ? OR `id` = ?;",[t.newStage,r,i,t.deniedPaymentId])}catch{}await e("INSERT INTO `prospect_stage_history` (`id`, `prospect_id`, `to_stage_id`, `notes`, `changed_by`, `created_at`)\n       VALUES (?, ?, ?, ?, ?, ?);",[n(),i,o,t.note||`Stage updated to ${t.newStage}`,t.changedByUserId||null,r]),await e("INSERT INTO `activities` (`id`, `actor_id`, `prospect_id`, `activity_type`, `message`, `created_at`)\n       VALUES (?, ?, ?, 'stage_change', ?, ?);",[n(),t.changedByUserId||null,i,`Changed stage to "${t.newStage}": ${t.note}`,r])}return await a(t.deniedPaymentId)||{id:t.deniedPaymentId,prospect_id:i,prospect_name:`Prospect`,agent_id:t.changedByUserId||null,agent_name:t.changedByUserName||`Agent`,phone:``,service:`Software License`,denial_reason:t.note,denied_by:`Client`,denied_at:r,amount:0,current_stage:t.newStage,notes:t.note,created_at:r,updated_at:r}}var l=(e={})=>t({queryKey:[`denied-payments`,e],queryFn:()=>r(e)}),u=e=>t({queryKey:[`stage-history-prospect`,e],queryFn:()=>o(e),enabled:!!e});export{u as i,s as n,l as r,c as t};