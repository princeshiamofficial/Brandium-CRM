# CONTEXT.md - Brandium CRM Domain Model & Vocabulary

## System Overview

Brandium CRM is a production-grade Customer Relationship Management & Order Management system for creative digital media agencies.

## Domain Concepts

- **Lead / Prospect**: Potential client undergoing qualification and nurturing across stages (`new-lead`, `contacted`, `proposal-sent`, `negotiation`, `won`).
- **Project / Order**: A contracted piece of work with specific creative deliverables, budget, deadlines, and assigned artist/agent team members.
- **Service**: Deliverable agency capability (e.g. `TVC`, `Graphics Design`, `Product Photography`, `Logo Design`, `Video Ads`, etc.) stored in the `services` table.
- **Advance Payment**: Upfront or installment payment made by the client, persisted in `projects.advance_payments` as structured records.
- **Stage**: Workflow phase for projects (`CR Clearance`, `On Design`, `CO Clearance`, `Logistics`, `Delivered`).
- **Artist**: Creative team member responsible for production and asset design.
- **Agent**: Account representative managing client relations, project entry, and invoicing.
