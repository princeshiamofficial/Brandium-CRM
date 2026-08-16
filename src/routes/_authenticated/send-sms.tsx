import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_authenticated/send-sms")({
  head: () => ({
    meta: [
      { title: "Send SMS | Brandium Telesales CRM" },
      { name: "description", content: "Compose and send SMS messages to prospects and clients." },
      { property: "og:title", content: "Send SMS | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Compose and send SMS messages to prospects and clients.",
      },
    ],
  }),
  component: () => (
    <PlaceholderPage
      title="Send SMS"
      description="Compose and send SMS messages to prospects and clients."
    />
  ),
});
