import{n as e,t}from"./client-95e7hDoa.js";import{t as n}from"./mysql-api-C74RjZ50.js";import{i as r,t as i}from"./queryOptions-lNXbnasO.js";import{t as a}from"./useMutation-psWD_niU.js";import{t as o}from"./format-DSso9CUC.js";import{a as s,i as c,r as l}from"./types-DLFYuhRP.js";import{i as u}from"./admin-users-6ZcLBjfJ.js";var d=c({page:l().catch(1),search:s().optional(),status:s().optional(),agent:s().optional(),from:s().optional(),to:s().optional()}),f=e=>e.status===`pending`&&new Date(e.due_at).getTime()<Date.now(),p=e=>f(e)?`overdue`:e.status,m=e=>{switch(e){case`completed`:return`default`;case`overdue`:return`destructive`;case`cancelled`:return`outline`;default:return`secondary`}},h=10,g=(e,t,r)=>i({queryKey:[`follow-ups`,e,t,r],queryFn:async()=>{try{let i=await n(`SELECT 
            f.*,
            p.contact_name AS prospect_name,
            p.business_name AS prospect_business,
            p.phone AS prospect_phone,
            p.stage_id,
            s.name AS stage_name,
            s.stage_group,
            s.color AS stage_color,
            u.name AS agent_name,
            c.name AS creator_name
          FROM \`follow_ups\` f
          LEFT JOIN \`prospects\` p ON f.prospect_id = p.id
          LEFT JOIN \`stages\` s ON p.stage_id = s.id
          LEFT JOIN \`users\` u ON f.assigned_to = u.id
          LEFT JOIN \`users\` c ON f.created_by = c.id
          ORDER BY f.due_at DESC, f.created_at DESC;`);if(i.success&&Array.isArray(i.data)){let n=i.data.map(e=>{let t=String(e.due_at||new Date().toISOString()),n=String(e.status||`pending`);return{id:String(e.id),prospect_id:String(e.prospect_id),assigned_to:e.assigned_to||null,created_by:e.created_by||null,due_at:t,note:e.note||null,status:n,created_at:String(e.created_at||new Date().toISOString()),updated_at:String(e.updated_at||new Date().toISOString()),prospect_name:e.prospect_name||`Contact Name`,prospect_business:e.prospect_business||null,prospect_phone:e.prospect_phone||null,agent_name:e.agent_name||`Assigned Agent`,creator_name:e.creator_name||`Admin`,stage_name:e.stage_name||null,stage_group:e.stage_group||null,stage_color:e.stage_color||null,effective_status:p({status:n,due_at:t})}});if(!r&&t&&(n=n.filter(e=>e.assigned_to===t)),e.agent&&(n=n.filter(t=>t.assigned_to===e.agent)),e.status&&(n=e.status===`overdue`?n.filter(e=>e.effective_status===`overdue`):n.filter(t=>t.status===e.status)),e.from){let t=new Date(e.from).getTime();n=n.filter(e=>new Date(e.due_at).getTime()>=t)}if(e.to){let t=new Date(`${e.to}T23:59:59`).getTime();n=n.filter(e=>new Date(e.due_at).getTime()<=t)}if(e.search){let t=e.search.toLowerCase();n=n.filter(e=>(e.prospect_name||``).toLowerCase().includes(t)||(e.prospect_business||``).toLowerCase().includes(t)||(e.prospect_phone||``).toLowerCase().includes(t)||(e.note||``).toLowerCase().includes(t))}let a=n.length,o=e.page||1;return{data:n.slice((o-1)*h,o*h),count:a,pageCount:Math.max(1,Math.ceil(a/h))}}}catch(e){console.warn(`followUpsQuery MySQL notice:`,e)}return{data:[],count:0,pageCount:1}}}),_=(e,t)=>i({queryKey:[`follow-up-summary`,e,t],queryFn:async()=>{try{let r=await n(`SELECT 
            status, 
            due_at, 
            assigned_to 
          FROM \`follow_ups\`;`);if(r.success&&Array.isArray(r.data)){let n=r.data;!t&&e&&(n=n.filter(t=>String(t.assigned_to)===e));let i=new Date().toISOString(),a=n.filter(e=>String(e.status)===`pending`&&String(e.due_at||``)>=i).length,o=n.filter(e=>String(e.status)===`completed`).length,s=n.filter(e=>String(e.status)===`cancelled`).length,c=n.filter(e=>String(e.status)===`pending`&&String(e.due_at||``)<i).length;return{total:n.length,pending:a,completed:o,cancelled:s,overdue:c}}}catch(e){console.warn(`followUpSummaryQuery MySQL notice:`,e)}return{total:0,pending:0,completed:0,cancelled:0,overdue:0}}}),v=e=>i({queryKey:[`prospect-timeline`,e],queryFn:async()=>{try{let t=[],r=await n(`SELECT 
            f.id,
            f.due_at AS raw_due_at,
            f.created_at,
            f.updated_at,
            f.note,
            f.status,
            COALESCE(u.name, 'Agent') AS agent_name,
            COALESCE(s.name, 'Follow-up') AS stage_name
          FROM \`follow_ups\` f
          LEFT JOIN \`prospects\` p ON f.prospect_id = p.id
          LEFT JOIN \`stages\` s ON p.stage_id = s.id
          LEFT JOIN \`users\` u ON f.assigned_to = u.id
          WHERE f.prospect_id = '${e}'
          ORDER BY f.created_at ASC;`);if(r.success&&Array.isArray(r.data))for(let e of r.data){let n=new Date(String(e.updated_at||e.created_at||e.raw_due_at)),r=String(e.status||`pending`),i=String(e.raw_due_at||new Date().toISOString());t.push({id:String(e.id),date:o(n,`dd MMM yyyy`),time:o(n,`hh:mm a`),note:e.note||`Follow-up note`,agent:String(e.agent_name||`Agent`),status:p({status:r,due_at:i}),raw_due_at:i,created_at:String(e.created_at||new Date().toISOString()),stage_name:e.stage_name||`Follow-up`})}let i=await n(`SELECT 
            h.id,
            h.changed_at,
            h.note,
            COALESCE(u.name, 'System') AS agent_name,
            COALESCE(s.name, 'Stage Updated') AS stage_name
          FROM \`prospect_stage_history\` h
          LEFT JOIN \`stages\` s ON h.to_stage_id = s.id
          LEFT JOIN \`users\` u ON h.changed_by = u.id
          WHERE h.prospect_id = '${e}'
          ORDER BY h.changed_at ASC;`);if(i.success&&Array.isArray(i.data))for(let e of i.data){let n=new Date(String(e.changed_at));t.push({id:String(e.id),date:o(n,`dd MMM yyyy`),time:o(n,`hh:mm a`),note:e.note||`Stage updated to ${String(e.stage_name||`Stage`)}`,agent:String(e.agent_name||`System`),status:`completed`,raw_due_at:String(e.changed_at),created_at:String(e.changed_at),stage_name:String(e.stage_name)})}return t.sort((e,t)=>new Date(e.created_at).getTime()-new Date(t.created_at).getTime()),t}catch(e){console.warn(`prospectTimelineQuery MySQL notice:`,e)}return[]}}),y=()=>i({queryKey:[`agent-profiles`],queryFn:async()=>{try{let e=await u();if(e&&e.length>0)return e.map(e=>({id:e.id,name:`${e.name}${e.role?` (${e.role})`:``}`}))}catch{}return[{id:`usr-admin-1`,name:`Admin (Executive)`},{id:`usr-agent-1`,name:`Tanvir Hasan (Agent)`},{id:`usr-agent-2`,name:`Nusrat Jahan (Agent)`},{id:`usr-agent-3`,name:`Rafiqul Islam (Agent)`}]}});function b(){let t=r();return a({mutationFn:async t=>{let r=e=>e?e.replace(/'/g,`''`):``;try{await n(`UPDATE \`follow_ups\` 
           SET \`status\` = '${t.status}', 
               \`updated_at\` = NOW() 
               ${t.note?`, \`note\` = '${r(t.note)}'`:``}
           WHERE \`id\` = '${t.id}';`)}catch(e){console.warn(`useSetFollowUpStatus MySQL notice:`,e)}if(t.prospectId)try{let i=e();await n(`INSERT INTO \`activities\` (\`id\`, \`prospect_id\`, \`activity_type\`, \`message\`, \`created_at\`)
             VALUES ('${i}', '${t.prospectId}', 'follow_up_${t.status}', 'Follow-up task marked ${t.status}${t.prospectName?` for ${r(t.prospectName)}`:``}${t.note?` — ${r(t.note)}`:``}', NOW());`)}catch{}return{success:!0}},onSuccess:()=>{t.invalidateQueries({queryKey:[`follow-ups`]}),t.invalidateQueries({queryKey:[`follow-up-summary`]}),t.invalidateQueries({queryKey:[`prospect-follow-ups`]}),t.invalidateQueries({queryKey:[`prospect-timeline`]}),t.invalidateQueries({queryKey:[`dashboard`]}),t.invalidateQueries({queryKey:[`activities`]})}})}function x(){let i=r();return a({mutationFn:async r=>{let i=e=>e?e.replace(/'/g,`''`):``,a=e(),s=new Date().toISOString().slice(0,19).replace(`T`,` `),c=new Date(r.due_at).toISOString().slice(0,19).replace(`T`,` `);try{await n(`INSERT INTO \`follow_ups\` (\`id\`, \`prospect_id\`, \`assigned_to\`, \`created_by\`, \`due_at\`, \`status\`, \`note\`, \`created_at\`, \`updated_at\`)
           VALUES ('${a}', '${r.prospect_id}', '${r.assigned_to}', '${r.created_by}', '${c}', 'pending', ${r.note?`'${i(r.note)}'`:`NULL`}, NOW(), NOW());`);let l=e();await n(`INSERT INTO \`activities\` (\`id\`, \`prospect_id\`, \`actor_id\`, \`activity_type\`, \`message\`, \`created_at\`)
           VALUES ('${l}', '${r.prospect_id}', '${r.created_by}', 'follow_up_created', 'New follow-up task scheduled for ${o(new Date(r.due_at),`dd MMM yyyy, hh:mm a`)}${r.note?` — ${i(r.note)}`:``}', NOW());`);let u=await n("SELECT `id` FROM `stages` WHERE LOWER(TRIM(`name`)) LIKE '%follow%' LIMIT 1;"),d=u?.success&&u.data?.[0]?String(u.data[0].id):`follow-up`,f=null;try{let e=await n("SELECT `stage_id` FROM `prospects` WHERE `id` = ? LIMIT 1;",[r.prospect_id]);e?.success&&e.data?.[0]&&(f=String(e.data[0].stage_id||``)||null)}catch{}await n("UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;",[d,s,r.prospect_id]);let p=e();await n("INSERT INTO `prospect_stage_history` (`id`, `prospect_id`, `from_stage_id`, `to_stage_id`, `note`, `changed_at`)\n           VALUES (?, ?, ?, ?, ?, ?);",[p,r.prospect_id,f,d,`Follow-up scheduled for ${o(new Date(r.due_at),`dd MMM yyyy, hh:mm a`)}${r.note?` — ${r.note}`:``}`,s]);try{await t.from(`prospects`).update({stage_id:d,stage_name:`Follow-up`,updated_at:new Date().toISOString()}).eq(`id`,r.prospect_id)}catch{}}catch(e){console.warn(`useCreateFollowUp MySQL notice:`,e)}return{id:a,prospect_id:r.prospect_id}},onSuccess:e=>{i.invalidateQueries({queryKey:[`follow-ups`]}),i.invalidateQueries({queryKey:[`follow-up-summary`]}),i.invalidateQueries({queryKey:[`prospect-follow-ups`]}),i.invalidateQueries({queryKey:[`prospect-timeline`]}),i.invalidateQueries({queryKey:[`activities`]}),i.invalidateQueries({queryKey:[`prospects`]}),i.invalidateQueries({queryKey:[`prospects-stats`]}),i.invalidateQueries({queryKey:[`dashboard`]}),e?.prospect_id&&i.invalidateQueries({queryKey:[`stage-history`,e.prospect_id]})}})}export{v as a,b as c,g as i,d as n,m as o,_ as r,x as s,y as t};