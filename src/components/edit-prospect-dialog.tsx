import { useState, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserCheck,
  FileText,
  Edit3,
  Loader2,
  Save,
  Palette,
  Globe,
  Image as ImageIcon,
  Upload,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Prospect,
  checkDuplicateProspectPhone,
  type DuplicatePhoneMatch,
} from "@/lib/prospects";
import { servicesQueryOptions } from "@/lib/services";
import { agentOptionsQueryOptions, artistOptionsQueryOptions } from "@/lib/won-sales";
import { useAuth } from "@/lib/auth";
import { runMySQLQuery } from "@/lib/mysql-api";
import { getMySQLTimestamp } from "@/lib/mysql-client";
import { uploadImageFile } from "@/lib/upload";

interface EditProspectDialogProps {
  prospectId?: string | null;
  prospect?: Prospect | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProspectDialog({
  prospectId: propProspectId,
  prospect,
  open,
  onOpenChange,
  onSuccess,
}: EditProspectDialogProps) {
  const prospectId = prospect?.id || propProspectId || null;
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const isCurrentUserAgent =
    role === "agent" || user?.user_metadata?.role?.toLowerCase() === "agent";

  // Form fields state initialized directly from prospect if provided
  const [contactName, setContactName] = useState(prospect?.contact_name || "");
  const [businessName, setBusinessName] = useState(prospect?.business_name || "");
  const [designation, setDesignation] = useState(prospect?.designation || "");
  const [phone, setPhone] = useState(prospect?.phone || "");
  const [altPhone, setAltPhone] = useState(prospect?.alternative_phone || "");
  const [email, setEmail] = useState(prospect?.email || "");
  const [websiteUrl, setWebsiteUrl] = useState(prospect?.website_url || "");
  const [logoUrl, setLogoUrl] = useState(prospect?.logo_url || "");
  const [previewUrl, setPreviewUrl] = useState(prospect?.logo_url || "");
  const [imgError, setImgError] = useState(false);
  const [address, setAddress] = useState(prospect?.address || "");
  const [serviceId, setServiceId] = useState<string>(
    prospect?.service_id && prospect.service_id.trim() ? prospect.service_id : "none",
  );
  const [artist, setArtist] = useState<string>(
    prospect?.assigned_artist_id && prospect.assigned_artist_id.trim()
      ? prospect.assigned_artist_id
      : "none",
  );
  const [assignedTo, setAssignedTo] = useState<string>(
    prospect?.assigned_to && prospect.assigned_to.trim() ? prospect.assigned_to : "none",
  );
  const [notes, setNotes] = useState(prospect?.notes || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [duplicateMatch, setDuplicateMatch] = useState<DuplicatePhoneMatch | null>(null);

  // Synchronize previewUrl and clear error whenever logoUrl changes
  useEffect(() => {
    setPreviewUrl(logoUrl);
    setImgError(false);
  }, [logoUrl]);

  // Debounced real-time duplicate phone number check excluding current prospect
  useEffect(() => {
    const rawNumber = (phone || altPhone).trim();
    if (!rawNumber || rawNumber.length < 6) {
      setDuplicateMatch(null);
      return;
    }

    const currentId = prospect?.id || prospectId || undefined;
    const timer = setTimeout(async () => {
      const result = await checkDuplicateProspectPhone(rawNumber, currentId);
      setDuplicateMatch(result.isDuplicate ? result : null);
    }, 350);

    return () => clearTimeout(timer);
  }, [phone, altPhone, prospect?.id, prospectId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant 0ms local preview before network upload completes
    const instantBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(instantBlobUrl);
    setImgError(false);

    try {
      setIsUploading(true);
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        setLogoUrl(res.url);
        setPreviewUrl(res.url);
        toast.success("Logo uploaded successfully!");
      } else {
        toast.error(res.error || "Failed to upload logo.");
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Queries for dropdown options
  const { data: rawServices = [] } = useQuery(servicesQueryOptions());
  const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());
  const { data: rawArtists = [] } = useQuery(artistOptionsQueryOptions());

  const services = useMemo(() => (Array.isArray(rawServices) ? rawServices : []), [rawServices]);
  const agents = useMemo(() => (Array.isArray(rawAgents) ? rawAgents : []), [rawAgents]);
  const artists = useMemo(() => (Array.isArray(rawArtists) ? rawArtists : []), [rawArtists]);

  // Fetch fresh prospect data for editing from MySQL database brandium_crm
  const prospectQuery = useQuery({
    queryKey: ["prospect-edit-dialog", prospectId],
    enabled: Boolean(prospectId && open),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    queryFn: async (): Promise<
      | (Prospect & {
          assigned_artist_id?: string | null;
          website_url?: string | null;
          logo_url?: string | null;
        })
      | null
    > => {
      if (!prospectId) return null;

      // Direct MySQL query
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT * FROM `prospects` WHERE `id` = ? LIMIT 1",
        [prospectId],
      );
      if (res.success && Array.isArray(res.data) && res.data[0]) {
        const p = res.data[0];
        return {
          id: String(p["id"]),
          contact_name: String(p["contact_name"] || ""),
          business_name: (p["business_name"] as string) || null,
          designation: (p["designation"] as string) || null,
          phone: (p["phone"] as string) || null,
          alternative_phone: (p["alternative_phone"] as string) || null,
          email: (p["email"] as string) || null,
          address: (p["address"] as string) || null,
          website_url: (p["website_url"] as string) || null,
          logo_url: (p["logo_url"] as string) || null,
          service_id: (p["service_id"] as string) || null,
          stage_id: (p["stage_id"] as string) || null,
          assigned_to: (p["assigned_to"] as string) || null,
          assigned_artist_id: (p["assigned_artist_id"] as string) || null,
          created_by: (p["created_by"] as string) || null,
          notes: (p["notes"] as string) || null,
          created_at: String(p["created_at"] || new Date().toISOString()),
          updated_at: String(p["updated_at"] || new Date().toISOString()),
        };
      }

      return null;
    },
  });

  // Pre-fill form when prospect data loads or dialog opens
  useEffect(() => {
    const p = prospectQuery.data || prospect;
    if (open && p) {
      setContactName(p.contact_name || "");
      setBusinessName(p.business_name || "");
      setDesignation(p.designation || "");
      setPhone(p.phone || "");
      setAltPhone(p.alternative_phone || "");
      setEmail(p.email || "");
      setWebsiteUrl(p.website_url || "");
      setLogoUrl(p.logo_url || "");
      setAddress(p.address || "");
      setServiceId(p.service_id && p.service_id.trim() ? p.service_id : "none");

      let rawNotes = p.notes || "";

      // 1. Resolve Assigned Agent
      let agentId = p.assigned_to && p.assigned_to !== "none" ? p.assigned_to : "";
      const agentMatch = rawNotes.match(/\[Agent:\s*([^\]]+)\]/i);
      if (!agentId && agentMatch && agentMatch[1]) {
        agentId = agentMatch[1].trim();
      }
      if (agentId && agents.length > 0) {
        const matchedAg = agents.find(
          (a) => a.id === agentId || a.name.toLowerCase() === agentId.toLowerCase(),
        );
        if (matchedAg) agentId = matchedAg.id;
      }
      if (!agentId && isCurrentUserAgent && user?.id) {
        agentId = user.id;
      }

      // 2. Resolve Selected Artist
      let artistId =
        p.assigned_artist_id && p.assigned_artist_id !== "none" ? p.assigned_artist_id : "";
      const artistMatch = rawNotes.match(/\[Artist:\s*([^\]]+)\]/i);
      if (!artistId && artistMatch && artistMatch[1]) {
        artistId = artistMatch[1].trim();
      }
      if (artistId && artists.length > 0) {
        const matchedArt = artists.find(
          (a) => a.id === artistId || a.name.toLowerCase() === artistId.toLowerCase(),
        );
        if (matchedArt) artistId = matchedArt.id;
      }

      rawNotes = rawNotes.replace(/\[Artist:\s*([^\]]+)\]/gi, "").trim();
      rawNotes = rawNotes.replace(/\[Agent:\s*([^\]]+)\]/gi, "").trim();

      setAssignedTo(agentId || "none");
      setArtist(artistId || "none");
      setNotes(rawNotes);
    }
  }, [open, prospect, prospectQuery.data, agents, artists, isCurrentUserAgent, user?.id]);

  // Normalize artist ID whenever artists options finish loading
  useEffect(() => {
    if (artist && artist !== "none" && artists.length > 0) {
      const matched = artists.find(
        (a) => a.id === artist || a.name.toLowerCase() === artist.toLowerCase(),
      );
      if (matched && artist !== matched.id) {
        setArtist(matched.id);
      }
    }
  }, [artists, artist]);

  // Normalize agent ID whenever agents options finish loading
  useEffect(() => {
    if (assignedTo && assignedTo !== "none" && agents.length > 0) {
      const matched = agents.find(
        (a) => a.id === assignedTo || a.name.toLowerCase() === assignedTo.toLowerCase(),
      );
      if (matched && assignedTo !== matched.id) {
        setAssignedTo(matched.id);
      }
    }
  }, [agents, assignedTo]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!prospectId) throw new Error("No prospect selected.");
      if (!contactName.trim()) throw new Error("Contact Name is required.");

      const updateData = {
        contact_name: contactName.trim(),
        business_name: businessName.trim() || null,
        designation: designation.trim() || null,
        phone: phone.trim() || null,
        alternative_phone: altPhone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        website_url: websiteUrl.trim() || null,
        logo_url: logoUrl.trim() || null,
        service_id: serviceId !== "none" ? serviceId : null,
        assigned_to: assignedTo !== "none" ? assignedTo : null,
        assigned_artist_id: artist !== "none" ? artist : null,
        notes: notes.trim() || null,
      };

      // Direct UPDATE to MySQL database brandium_crm.prospects
      const now = getMySQLTimestamp();
      const res = await runMySQLQuery(
        `UPDATE \`prospects\` SET
          \`contact_name\` = ?,
          \`business_name\` = ?,
          \`designation\` = ?,
          \`phone\` = ?,
          \`alternative_phone\` = ?,
          \`email\` = ?,
          \`address\` = ?,
          \`website_url\` = ?,
          \`logo_url\` = ?,
          \`service_id\` = ?,
          \`assigned_to\` = ?,
          \`assigned_artist_id\` = ?,
          \`notes\` = ?,
          \`updated_at\` = ?
        WHERE \`id\` = ?`,
        [
          updateData.contact_name,
          updateData.business_name,
          updateData.designation,
          updateData.phone,
          updateData.alternative_phone,
          updateData.email,
          updateData.address,
          updateData.website_url,
          updateData.logo_url,
          updateData.service_id,
          updateData.assigned_to,
          updateData.assigned_artist_id,
          updateData.notes,
          now,
          prospectId,
        ],
      );

      if (!res.success) {
        throw new Error(res.error || "Failed to update prospect in database.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["prospect", prospectId] });
      queryClient.invalidateQueries({ queryKey: ["prospect-edit-dialog", prospectId] });
      toast.success("Prospect updated successfully!");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update prospect.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) {
      toast.error("Contact Name is required.");
      return;
    }
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card">
        {/* Header with Brand Icon */}
        <div className="flex items-start gap-3.5">
          <div className="size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#67B239] font-bold flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
            <Edit3 className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Edit Prospect
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Update prospect lead profile in Brandium CRM.
            </DialogDescription>
          </div>
        </div>

        {prospectQuery.isPending ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="size-8 animate-spin text-[#67B239]" />
            <p className="text-xs font-semibold text-slate-500">Loading prospect details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Section 1: Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Contact Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="size-3.5 text-[#67B239]" />
                  Contact Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Mehan Ahmed"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
                />
              </div>

              {/* Business Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-slate-500" />
                  Business Name
                </Label>
                <Input
                  placeholder="e.g. AurevixSoft"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
                />
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-slate-500" />
                  Designation / Title
                </Label>
                <Input
                  placeholder="e.g. Managing Director"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
                />
              </div>
            </div>

            {/* Section 2: Contact & Web Presence Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-emerald-600" />
                  Phone Number
                </Label>
                <Input
                  placeholder="+8801711002233"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
                />
              </div>

              {/* Alternative Phone */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-teal-500" />
                  Alternative Phone
                </Label>
                <Input
                  placeholder="+8801987654321"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
                />
              </div>

              {/* Real-time Duplicate Phone Detection Alert */}
              {duplicateMatch?.isDuplicate && duplicateMatch.match && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-amber-50/95 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/70 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-amber-950 dark:text-amber-200">
                        ⚠️ Duplicate Phone Detected:
                      </span>
                      <span>Already registered for</span>
                      <span className="font-bold text-slate-900 dark:text-white underline decoration-amber-400">
                        {duplicateMatch.match.contact_name}
                        {duplicateMatch.match.business_name
                          ? ` (${duplicateMatch.match.business_name})`
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-amber-800 dark:text-amber-300 pt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-200/70 dark:bg-amber-900/60 font-medium">
                        Stage: {duplicateMatch.match.stage_name}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200">
                        Agent: {duplicateMatch.match.assigned_agent_name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-blue-500" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="mehan@aurevixsoft.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
                />
              </div>

              {/* Website / Social URL */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="size-3.5 text-indigo-500" />
                  Website / Social URL
                </Label>
                <Input
                  placeholder="https://brandiumtech.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
                />
              </div>

              {/* Company Logo / Image Upload */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-pink-500" />
                  Company Logo / Image
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <div className="relative size-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {(previewUrl || logoUrl) && !imgError ? (
                      <img
                        key={previewUrl || logoUrl}
                        src={previewUrl || logoUrl}
                        alt="Logo Preview"
                        className="size-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <ImageIcon className="size-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs font-semibold gap-1.5 px-3 rounded-lg border border-pink-200 dark:border-pink-900/60 text-pink-600 dark:text-pink-400 bg-pink-50/60 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-all cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="size-3.5" />
                          {logoUrl ? "Change Logo" : "Upload Logo"}
                        </>
                      )}
                    </Button>

                    {logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLogoUrl("");
                          setPreviewUrl("");
                          setImgError(false);
                        }}
                        className="h-8 text-xs font-semibold gap-1 px-2.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-amber-500" />
                  Office Address / Location
                </Label>
                <Textarea
                  placeholder="House 42, Road 11, Banani, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 min-h-18.75 resize-y text-xs sm:text-sm rounded-xl focus:bg-white dark:focus:bg-card transition-all"
                  rows={2}
                />
              </div>
            </div>

            {/* Section 3: CRM Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Service Interested */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-purple-500" />
                  Service
                </Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all">
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                    <SelectItem value="none">No specific service</SelectItem>
                    {services.map((srv) => (
                      <SelectItem key={srv.id} value={srv.id}>
                        {srv.name}
                      </SelectItem>
                    ))}
                    {serviceId !== "none" && !services.some((srv) => srv.id === serviceId) && (
                      <SelectItem value={serviceId}>{serviceId}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Artist */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Palette className="size-3.5 text-[#67B239]" />
                  Select Artist
                </Label>
                <Select value={artist} onValueChange={setArtist}>
                  <SelectTrigger className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all">
                    <SelectValue placeholder="Select Artist" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                    <SelectItem value="none">No Artist Selected</SelectItem>
                    {artists.map((art) => (
                      <SelectItem key={art.id} value={art.id}>
                        {art.name}
                      </SelectItem>
                    ))}
                    {artist !== "none" && !artists.some((art) => art.id === artist) && (
                      <SelectItem value={artist}>{artist}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Assign Agent */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="size-3.5 text-emerald-600" />
                  Assigned Agent
                </Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all">
                    <SelectValue placeholder="Assign Agent" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                    <SelectItem value="none">Unassigned</SelectItem>
                    {agents.map((ag) => (
                      <SelectItem key={ag.id} value={ag.id}>
                        {ag.name}
                      </SelectItem>
                    ))}
                    {assignedTo !== "none" && !agents.some((ag) => ag.id === assignedTo) && (
                      <SelectItem value={assignedTo}>{assignedTo}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Section 4: Requirement Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="size-3.5 text-slate-500" />
                Notes / Key Requirements
              </Label>
              <Textarea
                placeholder="Enter specific client requirements, budget details, or source info..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm rounded-xl focus:bg-white dark:focus:bg-card transition-all resize-y"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                className="font-bold text-xs sm:text-sm h-9.5 rounded-xl border-slate-200/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#67B239] hover:bg-[#5aa030] text-white font-bold text-xs sm:text-sm h-9.5 rounded-xl shadow-2xs gap-1.5 transition-all cursor-pointer"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save & Update Prospect
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
