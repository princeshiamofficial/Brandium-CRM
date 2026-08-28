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
  Layers,
  UserCheck,
  FileText,
  PlusCircle,
  Loader2,
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
  createProspect,
  CreateProspectInput,
  checkDuplicateProspectPhone,
  type DuplicatePhoneMatch,
} from "@/lib/prospects";
import { stagesQuery } from "@/lib/stages";
import { servicesQueryOptions } from "@/lib/services";
import { agentOptionsQueryOptions, artistOptionsQueryOptions } from "@/lib/won-sales";
import { useAuth } from "@/lib/auth";
import { uploadImageFile } from "@/lib/upload";

interface AddProspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddProspectDialog({ open, onOpenChange, onSuccess }: AddProspectDialogProps) {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const isCurrentUserAgent =
    role === "agent" || user?.user_metadata?.role?.toLowerCase() === "agent";

  // Form fields state
  const [contactName, setContactName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [imgError, setImgError] = useState(false);
  const [address, setAddress] = useState("");
  const [serviceId, setServiceId] = useState<string>("none");
  const [artist, setArtist] = useState<string>("none");
  const [assignedTo, setAssignedTo] = useState<string>("none");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [duplicateMatch, setDuplicateMatch] = useState<DuplicatePhoneMatch | null>(null);

  // Synchronize previewUrl and clear errors whenever logoUrl is updated
  useEffect(() => {
    setPreviewUrl(logoUrl);
    setImgError(false);
  }, [logoUrl]);

  // Debounced real-time duplicate phone number check
  useEffect(() => {
    const rawNumber = (phone || altPhone).trim();
    if (!rawNumber || rawNumber.length < 6) {
      setDuplicateMatch(null);
      return;
    }

    const timer = setTimeout(async () => {
      const result = await checkDuplicateProspectPhone(rawNumber);
      setDuplicateMatch(result.isDuplicate ? result : null);
    }, 350);

    return () => clearTimeout(timer);
  }, [phone, altPhone]);

  // Queries for dropdown options
  const { data: rawStages = [] } = useQuery(stagesQuery());
  const { data: rawServices = [] } = useQuery(servicesQueryOptions());
  const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());
  const { data: rawArtists = [] } = useQuery(artistOptionsQueryOptions());

  const stages = useMemo(() => (Array.isArray(rawStages) ? rawStages : []), [rawStages]);
  const services = useMemo(() => (Array.isArray(rawServices) ? rawServices : []), [rawServices]);
  const agents = useMemo(() => (Array.isArray(rawAgents) ? rawAgents : []), [rawAgents]);
  const artists = useMemo(() => (Array.isArray(rawArtists) ? rawArtists : []), [rawArtists]);

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

  // Auto pre-fill assigned agent when opening dialog if logged in user is an agent
  useEffect(() => {
    if (open && isCurrentUserAgent && user?.id) {
      setAssignedTo(user.id);
    }
  }, [open, isCurrentUserAgent, user?.id]);

  const resetForm = () => {
    setContactName("");
    setBusinessName("");
    setDesignation("");
    setPhone("");
    setAltPhone("");
    setEmail("");
    setWebsiteUrl("");
    setLogoUrl("");
    setPreviewUrl("");
    setImgError(false);
    setAddress("");
    setServiceId("none");
    setArtist("none");
    setAssignedTo(isCurrentUserAgent && user?.id ? user.id : "none");
    setNotes("");
    setDuplicateMatch(null);
  };

  const createMutation = useMutation({
    mutationFn: async (input: CreateProspectInput) => createProspect(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      toast.success("Prospect added successfully!");
      resetForm();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add prospect. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) {
      toast.error("Contact Name is required.");
      return;
    }

    // Default stage is Prospect
    const prospectStage =
      stages.find((s) => s.name.toLowerCase() === "prospect") || stages.find((s) => s.is_active);
    const initialStageId = prospectStage?.id || "prospect";
    createMutation.mutate({
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
      stage_id: initialStageId,
      assigned_to: assignedTo !== "none" ? assignedTo : user?.id || null,
      assigned_artist_id: artist !== "none" ? artist : null,
      created_by: user?.id || null,
      notes: notes.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card">
        {/* Header with Brand Icon */}
        <div className="flex items-start gap-3.5">
          <div className="size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#67B239] font-bold flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
            <PlusCircle className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Add New Prospect
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Create a new lead profile in Brandium CRM to start tracking sales stages.
            </DialogDescription>
          </div>
        </div>

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
                className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 min-h-[75px] resize-y text-xs sm:text-sm rounded-xl focus:bg-white dark:focus:bg-card transition-all"
                rows={2}
              />
            </div>
          </div>

          {/* Section 3: CRM Assignment & Pipeline Stage */}
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
              disabled={createMutation.isPending}
              className="font-bold text-xs sm:text-sm h-9.5 rounded-xl border-slate-200/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#67B239] hover:bg-[#5aa030] text-white font-bold text-xs sm:text-sm h-9.5 rounded-xl shadow-2xs gap-1.5 transition-all cursor-pointer"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving Prospect...
                </>
              ) : (
                <>
                  <PlusCircle className="size-4" />
                  Save & Add Prospect
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
