"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  RadioTower,
  RefreshCw,
  Save,
  Send,
  Wallet,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { formatCrmDateTime } from "@/lib/mysql-client";
import { calculateSmsParts } from "@/lib/sms";

type GatewaySettings = {
  provider: string;
  api_url: string;
  balance_url: string;
  sender_id: string;
  label: "transactional" | "promotional";
  is_enabled: boolean;
  updated_at: string | null;
  has_api_key: boolean;
  api_key_masked: string;
};

type GatewayResult = { success: boolean; response: string };

const API_PARAMETERS = [
  { name: "api_key", value: "API Key", description: "Your MRAM API key (stored on the server)" },
  {
    name: "type",
    value: "text / unicode",
    description: "Chosen automatically: unicode for Bangla",
  },
  {
    name: "contacts",
    value: "mobile number",
    description: "8801XXXXXXXXX, multiple joined with +",
  },
  { name: "senderid", value: "Approved Sender ID", description: "Sender ID approved by MRAM" },
  {
    name: "msg",
    value: "SMS body",
    description: "Sent URL-encoded, so &, $, @ etc. are safe",
  },
  {
    name: "label",
    value: "transactional / promotional",
    description: "Use transactional for transactional SMS",
  },
];

async function fetchSettings(): Promise<GatewaySettings> {
  const res = await fetch("/api/sms/gateway", { cache: "no-store" });
  const json = (await res.json()) as { success: boolean; data?: GatewaySettings; error?: string };
  if (!json.success || !json.data) throw new Error(json.error || "Failed to load settings.");
  return json.data;
}

async function fetchBalance(): Promise<GatewayResult> {
  const res = await fetch("/api/sms/balance", { cache: "no-store" });
  return (await res.json()) as GatewayResult;
}

function SettingsForm({ settings }: { settings: GatewaySettings }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [apiUrl, setApiUrl] = useState(settings.api_url);
  const [balanceUrl, setBalanceUrl] = useState(settings.balance_url);
  const [apiKey, setApiKey] = useState("");
  const [senderId, setSenderId] = useState(settings.sender_id);
  const [label, setLabel] = useState(settings.label);
  const [isEnabled, setIsEnabled] = useState(settings.is_enabled);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sms/gateway", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_url: apiUrl,
          balance_url: balanceUrl,
          api_key: apiKey.trim() || undefined,
          sender_id: senderId,
          label,
          is_enabled: isEnabled,
          updated_by: user?.id ?? null,
        }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error || "Failed to save settings.");
    },
    onSuccess: () => {
      toast.success("SMS gateway settings saved");
      setApiKey("");
      void queryClient.invalidateQueries({ queryKey: ["sms-gateway-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["sms-gateway-balance"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="api_url">SMS API URL (GET & POST) *</Label>
          <Input
            id="api_url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            required
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="balance_url">Credit Balance API URL *</Label>
          <Input
            id="balance_url"
            value={balanceUrl}
            onChange={(e) => setBalanceUrl(e.target.value)}
            required
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            <code>{"{API_KEY}"}</code> is replaced with your API key on the server.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="api_key">API Key {settings.has_api_key ? "" : "*"}</Label>
          <div className="relative">
            <KeyRound className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="api_key"
              type="password"
              autoComplete="new-password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required={!settings.has_api_key}
              placeholder={
                settings.has_api_key ? `Saved: ${settings.api_key_masked}` : "Paste your API key"
              }
              className="pl-9 font-mono text-xs"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {settings.has_api_key
              ? "Leave blank to keep the saved key."
              : "The key is stored on the server and never shown again."}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sender_id">Approved Sender ID *</Label>
          <Input
            id="sender_id"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            required
            placeholder="e.g., 8809601000000 or BRANDIUM"
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Label</Label>
          <Select
            value={label}
            onValueChange={(v) => setLabel(v as "transactional" | "promotional")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transactional">Transactional</SelectItem>
              <SelectItem value="promotional">Promotional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <div>
            <p className="text-sm font-medium">Gateway Enabled</p>
            <p className="text-xs text-muted-foreground">Turn off to stop all outgoing SMS.</p>
          </div>
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5"
        >
          {saveMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Settings
        </Button>
      </div>
    </form>
  );
}

function TestSmsCard({ ready }: { ready: boolean }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("Test SMS from Brandium CRM.");
  const [lastResult, setLastResult] = useState<GatewayResult | null>(null);
  const info = calculateSmsParts(message);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phones: [phone], message }),
      });
      return (await res.json()) as GatewayResult;
    },
    onSuccess: (result) => {
      setLastResult(result);
      if (result.success) toast.success("Test SMS sent");
      else toast.error("Test SMS failed", { description: result.response });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Card className="shadow-xl border bg-card rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Send className="size-4 text-[#67B239]" /> Send Test SMS
        </CardTitle>
        <CardDescription>Check the gateway with a real message.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            sendMutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="test_phone">Mobile Number *</Label>
            <Input
              id="test_phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="01XXXXXXXXX"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="test_msg">Message *</Label>
            <Textarea
              id="test_msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {info.length} chars · {info.parts} SMS · {info.isUnicode ? "Unicode" : "Text"}
            </p>
          </div>
          {lastResult && (
            <p
              className={
                lastResult.success
                  ? "rounded-md bg-green-500/10 px-3 py-2 text-xs text-green-700 dark:text-green-300"
                  : "rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-400"
              }
            >
              Gateway reply: <span className="font-mono">{lastResult.response}</span>
            </p>
          )}
          <Button
            type="submit"
            disabled={!ready || sendMutation.isPending}
            className="w-full bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5"
          >
            {sendMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Send Test SMS
          </Button>
          {!ready && (
            <p className="text-center text-xs text-muted-foreground">
              Save an API key and Sender ID first.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default function SmsGatewayPage() {
  const settingsQuery = useQuery({ queryKey: ["sms-gateway-settings"], queryFn: fetchSettings });
  const settings = settingsQuery.data;
  const ready = Boolean(settings?.has_api_key && settings.sender_id && settings.is_enabled);

  const balanceQuery = useQuery({
    queryKey: ["sms-gateway-balance"],
    queryFn: fetchBalance,
    enabled: Boolean(settings?.has_api_key),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <RadioTower className="size-7 text-[#67B239]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">SMS Gateway</h1>
            <p className="text-sm text-muted-foreground">
              {settings?.provider || "MRAM Technologies"} text SMS API settings.
            </p>
          </div>
        </div>
        {settings && (
          <Badge
            variant="outline"
            className={
              ready
                ? "w-fit bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 gap-1 rounded-full px-2.5"
                : "w-fit bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 gap-1 rounded-full px-2.5"
            }
          >
            {ready ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
            {ready ? "Ready to send" : "Not configured"}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-xl border bg-card rounded-lg">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Wallet className="size-4 text-[#67B239]" /> Credit Balance
              </p>
              {balanceQuery.isFetching ? (
                <Skeleton className="mt-2 h-7 w-28" />
              ) : (
                <p
                  className="mt-1 truncate text-2xl font-bold text-foreground"
                  title={balanceQuery.data?.response}
                >
                  {!settings?.has_api_key
                    ? "—"
                    : balanceQuery.data?.success
                      ? balanceQuery.data.response
                      : "Unavailable"}
                </p>
              )}
              {balanceQuery.data && !balanceQuery.data.success && (
                <p className="mt-1 truncate text-xs text-destructive">
                  {balanceQuery.data.response}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              title="Refresh balance"
              disabled={!settings?.has_api_key || balanceQuery.isFetching}
              onClick={() => void balanceQuery.refetch()}
            >
              <RefreshCw className={balanceQuery.isFetching ? "size-4 animate-spin" : "size-4"} />
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-xl border bg-card rounded-lg">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Sender ID</p>
            <p className="mt-1 truncate font-mono text-xl font-bold text-foreground">
              {settings?.sender_id || "Not set"}
            </p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">
              Label: {settings?.label || "transactional"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-xl border bg-card rounded-lg">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">API Key</p>
            <p className="mt-1 truncate font-mono text-xl font-bold text-foreground">
              {settings?.api_key_masked || "Not set"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Updated: {settings?.updated_at ? formatCrmDateTime(settings.updated_at) : "Never"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-xl border bg-card rounded-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-4 text-[#67B239]" /> Gateway Settings
            </CardTitle>
            <CardDescription>
              Every SMS from Brandium (Send SMS, meeting reminders) goes through this gateway.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settingsQuery.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : settingsQuery.isError || !settings ? (
              <p className="text-sm text-destructive">
                {settingsQuery.error?.message || "Failed to load settings."}
              </p>
            ) : (
              <SettingsForm key={settings.updated_at ?? "new"} settings={settings} />
            )}
          </CardContent>
        </Card>
        <TestSmsCard ready={ready} />
      </div>

      <Card className="shadow-xl border bg-card rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Text SMS API Parameters</CardTitle>
          <CardDescription className="break-all font-mono text-xs">
            {settings?.api_url || "https://sms.mram.com.bd/smsapi"}
            ?api_key=(APIKEY)&type=text&contacts=(NUMBER)&senderid=(Approved Sender ID)&msg=(Message
            Content)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 min-w-32 font-semibold">Parameter Name</TableHead>
                  <TableHead className="min-w-40 font-semibold">Meaning / Value</TableHead>
                  <TableHead className="pr-6 min-w-60 font-semibold">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {API_PARAMETERS.map((p) => (
                  <TableRow key={p.name} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="pl-6 font-mono text-xs font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm">{p.value}</TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground">
                      {p.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
