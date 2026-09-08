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
  Loader2,
  Save,
  Palette,
  Globe,
  Upload,
  Trash2,
  AlertTriangle,
  UserPlus,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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

  // Debounced real-time duplicate phone number check with instant toast
  useEffect(() => {
    const rawNumber = (phone || altPhone).trim();
    if (!rawNumber || rawNumber.length < 6) {
      setDuplicateMatch(null);
      toast.dismiss("dup-edit-phone-toast");
      return;
    }

    const currentId = prospect?.id || prospectId || undefined;
    const timer = setTimeout(async () => {
      const result = await checkDuplicateProspectPhone(rawNumber, currentId);
      if (result.isDuplicate && result.match) {
        setDuplicateMatch(result);
        toast.error("This phone number already exists!", {
          id: "dup-edit-phone-toast",
          duration: 4000,
        });
      } else {
        setDuplicateMatch(null);
        toast.dismiss("dup-edit-phone-toast");
      }
    }, 400);

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
      setAssignedTo(agentId || "none");

      // 2. Resolve Assigned Artist
      let artistId =
        p.assigned_artist_id && p.assigned_artist_id !== "none" ? p.assigned_artist_id : "";
      const artistMatch = rawNotes.match(/\[Artist:\s*([^\]]+)\]/i);
      if (!artistId && artistMatch && artistMatch[1]) {
        artistId = artistMatch[1].trim();
      }
      if (artistId && artists.length > 0) {
        const matchedArt = artists.find(
          (art) => art.id === artistId || art.name.toLowerCase() === artistId.toLowerCase(),
        );
        if (matchedArt) artistId = matchedArt.id;
      }
      setArtist(artistId || "none");

      // Strip legacy bracket tags for clean user editing
      rawNotes = rawNotes.replace(/\[Agent:[^\]]+\]/gi, "");
      rawNotes = rawNotes.replace(/\[Artist:[^\]]+\]/gi, "");
      setNotes(rawNotes.trim());
    }
  }, [open, prospect, prospectQuery.data, agents, artists]);

  // If logged-in user is an agent, lock assignment to self
  useEffect(() => {
    if (isCurrentUserAgent && user?.id) {
      setAssignedTo(user.id);
    }
  }, [isCurrentUserAgent, user?.id]);

  // Mutation to update prospect in MySQL database brandium_crm
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!prospectId) throw new Error("Prospect ID is required");

      const now = getMySQLTimestamp();

      const updateData = {
        contact_name: contactName.trim() || "Unnamed Contact",
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

      // Direct MySQL Update with self-healing fallback
      const res = await runMySQLQuery(
        `UPDATE \`prospects\` 
         SET \`contact_name\` = ?,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) {
      toast.error("Contact Name is required.");
      return;
    }

    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }

    // Hard block if duplicate phone number exists for another prospect
    const rawNumber = phone.trim();
    if (rawNumber && rawNumber.length >= 6) {
      const currentId = prospect?.id || prospectId || undefined;
      const dupCheck = await checkDuplicateProspectPhone(rawNumber, currentId);
      if (dupCheck.isDuplicate && dupCheck.match) {
        setDuplicateMatch(dupCheck);
        toast.error("This phone number already exists!", {
          id: "dup-edit-phone-toast",
        });
        return;
      }
    }

    updateMutation.mutate();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-187.5 lg:max-w-200 p-0 flex flex-col h-full bg-[#f8f9fa] dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl focus:outline-none"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Edit Prospect</SheetTitle>
          <SheetDescription>Update prospect lead profile in Brandium CRM</SheetDescription>
        </SheetHeader>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-card shrink-0">
          <div>
            <h3 className="text-[18px] font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              Edit Prospect
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update prospect lead profile in Brandium CRM
            </p>
          </div>
        </div>

        {/* Offcanvas Body: Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {prospectQuery.isPending ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="size-8 animate-spin text-[#67B239]" />
              <p className="text-sm font-semibold text-slate-500">Loading prospect details...</p>
            </div>
          ) : (
            <form id="edit-prospect-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Accordion 1: Basic Info */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-[5px] bg-white dark:bg-card overflow-hidden shadow-2xs">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <span className="size-7.5 rounded-[5px] bg-[#67B239] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <UserPlus className="size-4" />
                  </span>
                  <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                    Basic Info
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Avatar Upload Section */}
                  <div className="flex items-center">
                    <div className="relative size-20 rounded-[6px] border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 mr-4 shrink-0 flex items-center justify-center overflow-hidden">
                      {(previewUrl || logoUrl) && !imgError ? (
                        <div className="relative size-19.5">
                          <img
                            src={previewUrl || logoUrl}
                            alt="Avatar Preview"
                            className="size-full object-cover rounded-[5px]"
                            onError={() => setImgError(true)}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setLogoUrl("");
                              setPreviewUrl("");
                              setImgError(false);
                            }}
                            title="Remove image"
                            className="absolute top-1 right-1 size-5 rounded-full bg-[#FDE9E9] text-[#EF1E1E] flex items-center justify-center transition-colors hover:bg-red-200 cursor-pointer shadow-xs"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <User className="size-8 text-slate-300 dark:text-slate-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="relative mb-2 px-2.5 py-1.5 bg-[#67B239] hover:bg-[#5aa030] text-white text-[13px] font-semibold rounded-[5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="size-3.5" />
                            <span>Upload file</span>
                          </>
                        )}
                      </button>
                      <span className="text-[14px] text-[#707070] dark:text-slate-400 font-normal">
                        JPG, GIF or PNG. Max size of 800K
                      </span>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contact Name */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#1F2020] dark:text-slate-200 mb-1.5">
                        Contact Name <span className="text-[#EF1E1E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. William Anderson"
                        className="w-full h-9.75 px-3 py-2 text-[14px] font-normal text-[#707070] dark:text-slate-200 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
                      />
                    </div>

                    {/* Job Title */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#1F2020] dark:text-slate-200 mb-1.5">
                        Job Title <span className="text-[#EF1E1E]">*</span>
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Data Analytics"
                        className="w-full h-9.75 px-3 py-2 text-[14px] font-normal text-[#707070] dark:text-slate-200 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#1F2020] dark:text-slate-200 mb-1.5">
                        Company Name <span className="text-[#EF1E1E]">*</span>
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. NovaWave LLC"
                        className="w-full h-9.75 px-3 py-2 text-[14px] font-normal text-[#707070] dark:text-slate-200 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#1F2020] dark:text-slate-200 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. william@example.com"
                        className="w-full h-9.75 px-3 py-2 text-[14px] font-normal text-[#707070] dark:text-slate-200 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#1F2020] dark:text-slate-200 mb-1.5">
                        Phone <span className="text-[#EF1E1E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1 555-0199"
                        className="w-full h-9.75 px-3 py-2 text-[14px] font-normal text-[#707070] dark:text-slate-200 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
                      />
                    </div>

                    {/* Website / Social URL */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#1F2020] dark:text-slate-200 mb-1.5">
                        Website / Social Link
                      </label>
                      <input
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="e.g. https://example.com"
                        className="w-full h-9.75 px-3 py-2 text-[14px] font-normal text-[#707070] dark:text-slate-200 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
                      />
                    </div>

                    {/* Office Address / Location */}
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[14px] font-medium text-[#1F2020] dark:text-slate-200 mb-1.5">
                        Address / Location
                      </label>
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 500 Terry Francois Street, San Francisco, CA"
                        className="w-full px-3 py-2 text-[14px] font-normal text-[#707070] dark:text-slate-200 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors resize-y"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion 2: Service & Notes Details */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-[5px] bg-white dark:bg-card overflow-hidden shadow-2xs">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <span className="size-7.5 rounded-[5px] bg-[#0a2e5c] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Briefcase className="size-4" />
                  </span>
                  <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                    Service & Notes
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Service */}
                  <div>
                    <label className="block text-[14px] font-medium text-[#1F2020] dark:text-slate-200 mb-1.5">
                      Service
                    </label>
                    <Select value={serviceId} onValueChange={setServiceId}>
                      <SelectTrigger className="w-full h-9.75 text-[14px] font-normal text-[#707070] dark:text-slate-200 bg-white dark:bg-card border-slate-200 dark:border-slate-800 rounded-[6px] shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none">
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[6px] border-slate-200 dark:border-slate-800">
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

                  {/* Notes */}
                  <div>
                    <label className="block text-[14px] font-medium text-[#1F2020] dark:text-slate-200 mb-1.5">
                      Notes / Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter specific client requirements, budget details, or lead source..."
                      className="w-full px-3 py-2 text-[14px] font-normal text-[#707070] dark:text-slate-200 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors resize-y"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sticky Bottom Action Footer */}
        <div className="sticky bottom-0 z-10 px-6 py-3.5 bg-white dark:bg-card border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
            className="px-4 py-2 rounded-[5px] border border-slate-200 dark:border-slate-800 text-[#707070] dark:text-slate-300 text-[14px] font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-prospect-form"
            disabled={updateMutation.isPending || Boolean(duplicateMatch?.isDuplicate)}
            className="px-5 py-2 rounded-[5px] bg-[#67B239] hover:bg-[#5aa030] text-white text-[14px] font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : duplicateMatch?.isDuplicate ? (
              <>
                <AlertTriangle className="size-4" />
                <span>Duplicate Phone Blocked</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
