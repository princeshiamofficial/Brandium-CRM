"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Send,
  Users,
  MessageSquare,
  PhoneCall,
  ListFilter,
  CheckSquare,
  Square,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import {
  sendSms,
  sendBulkSms,
  calculateSmsInfo,
  prospectsOptionsQuery,
  type SmsRecipientInput,
} from "@/lib/sms";
import { agentOptionsQueryOptions } from "@/lib/won-sales";
import { SmsBulkConfirmModal } from "@/components/sms-bulk-confirm-modal";

const PIPELINE_STAGES = [
  "Opportunity Created",
  "Follow-up",
  "Proposal Sent",
  "Negotiation",
  "Sales Won",
  "Denied Payment",
];

export default function SendSmsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  const [selectedProspectId, setSelectedProspectId] = useState<string>("");
  const [singlePhone, setSinglePhone] = useState<string>("");
  const [singleProspectName, setSingleProspectName] = useState<string>("");
  const [singleMessage, setSingleMessage] = useState<string>("");

  const [bulkFilterMode, setBulkFilterMode] = useState<"manual" | "stage" | "agent">("manual");
  const [selectedStage, setSelectedStage] = useState<string>("Opportunity Created");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [bulkSearch, setBulkSearch] = useState<string>("");
  const [selectedProspectIds, setSelectedProspectIds] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState<string>("");
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const { data: prospectOptions = [] } = useQuery(prospectsOptionsQuery());
  const { data: agentOptions = [] } = useQuery(agentOptionsQueryOptions());

  const handleSelectSingleProspect = (id: string) => {
    setSelectedProspectId(id);
    const found = prospectOptions.find((p) => p.id === id);
    if (found) {
      setSinglePhone(found.phone || "");
      setSingleProspectName(found.contact_name || "");
    }
  };

  const singleMutation = useMutation({
    mutationFn: async () => {
      return sendSms(
        singlePhone,
        singleMessage,
        selectedProspectId || null,
        singleProspectName || undefined,
        "Single",
        user?.id,
        user?.email || "Agent",
      );
    },
    onSuccess: (res) => {
      toast.success(`SMS dispatched successfully to ${singlePhone}! Log ID: ${res.apiResponseId}`);
      setSingleMessage("");
      void queryClient.invalidateQueries({ queryKey: ["sms-logs"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send SMS.");
    },
  });

  let targetBulkRecipients: SmsRecipientInput[] = [];

  if (bulkFilterMode === "manual") {
    targetBulkRecipients = prospectOptions
      .filter((p) => selectedProspectIds.includes(p.id) && Boolean(p.phone))
      .map((p) => ({
        prospect_id: p.id,
        prospect_name: p.contact_name,
        phone: p.phone!,
      }));
  } else if (bulkFilterMode === "stage") {
    targetBulkRecipients = prospectOptions
      .filter((p) => Boolean(p.phone))
      .map((p) => ({
        prospect_id: p.id,
        prospect_name: p.contact_name,
        phone: p.phone!,
      }));
  } else if (bulkFilterMode === "agent") {
    targetBulkRecipients = prospectOptions
      .filter((p) => Boolean(p.phone))
      .map((p) => ({
        prospect_id: p.id,
        prospect_name: p.contact_name,
        phone: p.phone!,
      }));
  }

  const bulkMutation = useMutation({
    mutationFn: async () => {
      return sendBulkSms(targetBulkRecipients, bulkMessage, user?.id, user?.email || "Agent");
    },
    onSuccess: (res) => {
      toast.success(`Bulk SMS broadcast complete! ${res.successCount} sent successfully.`);
      setConfirmModalOpen(false);
      setBulkMessage("");
      setSelectedProspectIds([]);
      void queryClient.invalidateQueries({ queryKey: ["sms-logs"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Bulk SMS dispatch failed.");
    },
  });

  const toggleSelectProspect = (id: string) => {
    if (selectedProspectIds.includes(id)) {
      setSelectedProspectIds(selectedProspectIds.filter((item) => item !== id));
    } else {
      setSelectedProspectIds([...selectedProspectIds, id]);
    }
  };

  const selectAllFilteredProspects = () => {
    const allIds = prospectOptions.filter((p) => Boolean(p.phone)).map((p) => p.id);
    setSelectedProspectIds(allIds);
  };

  const clearProspectSelection = () => {
    setSelectedProspectIds([]);
  };

  const singleSmsInfo = calculateSmsInfo(singleMessage);
  const bulkSmsInfo = calculateSmsInfo(bulkMessage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <MessageSquare className="size-6 text-[#67B239]" />
          Send SMS Gateway
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Dispatch single or bulk SMS broadcasts to prospects and clients.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "single" | "bulk")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 sm:w-80">
          <TabsTrigger value="single" className="gap-1.5 text-xs font-semibold">
            <Send className="size-3.5" />
            Single SMS
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-1.5 text-xs font-semibold">
            <Users className="size-3.5" />
            Bulk SMS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-4">
          <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="size-4 text-[#67B239]" />
                Single SMS Dispatch Form
              </CardTitle>
              <CardDescription className="text-xs">
                Select a prospect to auto-fill contact details or enter a recipient phone number
                directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="single_prospect" className="text-xs font-semibold">
                    Select Prospect (Auto-fill Phone)
                  </Label>
                  <Select value={selectedProspectId} onValueChange={handleSelectSingleProspect}>
                    <SelectTrigger id="single_prospect" className="text-xs">
                      <SelectValue placeholder="Choose a prospect..." />
                    </SelectTrigger>
                    <SelectContent>
                      {prospectOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.contact_name} {p.business_name ? `(${p.business_name})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recipient_phone" className="text-xs font-semibold">
                    Recipient Phone Number
                  </Label>
                  <div className="relative">
                    <PhoneCall className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="recipient_phone"
                      placeholder="+8801700000000"
                      value={singlePhone}
                      onChange={(e) => setSinglePhone(e.target.value)}
                      className="pl-9 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="single_msg" className="text-xs font-semibold">
                  SMS Message Content
                </Label>
                <Textarea
                  id="single_msg"
                  placeholder="Type your SMS message here..."
                  rows={4}
                  value={singleMessage}
                  onChange={(e) => setSingleMessage(e.target.value)}
                  className="text-xs leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono bg-white dark:bg-background">
                      {singleSmsInfo.length} chars
                    </Badge>
                    <span>
                      ({singleSmsInfo.parts} SMS Part{singleSmsInfo.parts > 1 ? "s" : ""})
                    </span>
                    <span>· {singleSmsInfo.remaining} chars left in current part</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {singleSmsInfo.isUnicode ? "Unicode (Bangla)" : "GSM-7 (English)"}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 px-6"
                  disabled={singleMutation.isPending || !singlePhone || !singleMessage}
                  onClick={() => singleMutation.mutate()}
                >
                  <Send className="size-4" />
                  {singleMutation.isPending ? "Sending SMS..." : "Send Single SMS"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="mt-4">
          <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="size-4 text-[#67B239]" />
                Bulk SMS Broadcast Form
              </CardTitle>
              <CardDescription className="text-xs">
                Target multiple prospects manually or filter audience by stage or assigned agent.
                Requires mandatory confirmation before broadcast.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <ListFilter className="size-3.5 text-blue-600" />
                  Audience Selection Method
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={bulkFilterMode === "manual" ? "default" : "outline"}
                    className={
                      bulkFilterMode === "manual"
                        ? "bg-[#67B239] hover:bg-[#5aa030] text-white"
                        : ""
                    }
                    size="sm"
                    onClick={() => setBulkFilterMode("manual")}
                  >
                    Select Multiple Prospects
                  </Button>
                  <Button
                    type="button"
                    variant={bulkFilterMode === "stage" ? "default" : "outline"}
                    className={
                      bulkFilterMode === "stage" ? "bg-[#67B239] hover:bg-[#5aa030] text-white" : ""
                    }
                    size="sm"
                    onClick={() => setBulkFilterMode("stage")}
                  >
                    OR Select by Stage
                  </Button>
                  <Button
                    type="button"
                    variant={bulkFilterMode === "agent" ? "default" : "outline"}
                    className={
                      bulkFilterMode === "agent" ? "bg-[#67B239] hover:bg-[#5aa030] text-white" : ""
                    }
                    size="sm"
                    onClick={() => setBulkFilterMode("agent")}
                  >
                    OR Select by Agent
                  </Button>
                </div>
              </div>

              {bulkFilterMode === "manual" && (
                <div className="space-y-2 border rounded-lg p-3 bg-slate-50/50 dark:bg-muted/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="relative flex-1 min-w-48">
                      <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search prospects..."
                        value={bulkSearch}
                        onChange={(e) => setBulkSearch(e.target.value)}
                        className="pl-8 h-8 text-xs bg-white dark:bg-background"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={selectAllFilteredProspects}
                      >
                        Select All ({prospectOptions.length})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={clearProspectSelection}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-border/60 rounded-md border bg-white dark:bg-background">
                    {prospectOptions
                      .filter(
                        (p) =>
                          !bulkSearch ||
                          p.contact_name.toLowerCase().includes(bulkSearch.toLowerCase()),
                      )
                      .map((p) => {
                        const isSelected = selectedProspectIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-muted/40 cursor-pointer text-xs"
                            onClick={() => toggleSelectProspect(p.id)}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <CheckSquare className="size-4 text-[#67B239]" />
                              ) : (
                                <Square className="size-4 text-slate-300" />
                              )}
                              <span className="font-semibold text-foreground">
                                {p.contact_name}
                              </span>
                              {p.business_name && (
                                <span className="text-muted-foreground text-[11px]">
                                  ({p.business_name})
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-muted-foreground text-[11px]">
                              {p.phone || "No phone"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {bulkFilterMode === "stage" && (
                <div className="space-y-1.5 border rounded-lg p-3 bg-slate-50/50 dark:bg-muted/30">
                  <Label htmlFor="stage_select" className="text-xs font-semibold">
                    Target Prospect Stage
                  </Label>
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger
                      id="stage_select"
                      className="text-xs bg-white dark:bg-background"
                    >
                      <SelectValue placeholder="Select Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map((stg) => (
                        <SelectItem key={stg} value={stg} className="text-xs">
                          {stg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {bulkFilterMode === "agent" && (
                <div className="space-y-1.5 border rounded-lg p-3 bg-slate-50/50 dark:bg-muted/30">
                  <Label htmlFor="agent_select" className="text-xs font-semibold">
                    Target Assigned Tele-sales Agent
                  </Label>
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                    <SelectTrigger
                      id="agent_select"
                      className="text-xs bg-white dark:bg-background"
                    >
                      <SelectValue placeholder="Select Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agentOptions.map((ag) => (
                        <SelectItem key={ag.id} value={ag.id} className="text-xs">
                          {ag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-2.5 text-xs flex items-center justify-between text-blue-900 dark:text-blue-200 font-medium">
                <span>Selected Broadcast Audience:</span>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  {targetBulkRecipients.length} Prospects Target
                </Badge>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bulk_msg" className="text-xs font-semibold">
                  Bulk Broadcast Message
                </Label>
                <Textarea
                  id="bulk_msg"
                  placeholder="Type bulk broadcast message content..."
                  rows={4}
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  className="text-xs leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono bg-white dark:bg-background">
                      {bulkSmsInfo.length} chars
                    </Badge>
                    <span>({bulkSmsInfo.parts} SMS Part per recipient)</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {bulkSmsInfo.isUnicode ? "Unicode (Bangla)" : "GSM-7 (English)"}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 px-6"
                  disabled={targetBulkRecipients.length === 0 || !bulkMessage}
                  onClick={() => setConfirmModalOpen(true)}
                >
                  <Send className="size-4" />
                  Review & Broadcast Bulk SMS ({targetBulkRecipients.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SmsBulkConfirmModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        recipients={targetBulkRecipients}
        message={bulkMessage}
        onConfirmSend={() => bulkMutation.mutate()}
        isSending={bulkMutation.isPending}
      />
    </div>
  );
}
