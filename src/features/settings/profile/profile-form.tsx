import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader, Trash2 } from "lucide-react";
import { getDisplayNameInitials } from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "@/hooks/api/use-session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/phone-input";
import { useDeleteAvatar, useUpdateProfile, useUploadAvatar } from "@/features/settings/hooks/use-auth-mutations";

const profileFormSchema = z.object({
  image: z.string().nullable().optional(),
  name: z
    .string("Please enter your name.")
    .min(3, "Name must be at least 3 characters.")
    .max(15, "Name must not be longer than 15 characters."),
  email: z.email("Please enter a valid email address."),
  phone: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().max(160).min(4).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { data: session, isLoading } = useSession();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatarMutation = useDeleteAvatar();

  const isUploading = uploadAvatar.isPending || deleteAvatarMutation.isPending;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
      image: session?.user?.image || null,
      email: session?.user?.email || "",
      phone: session?.user?.phone || "",
      company: session?.user?.company || "",
      bio: session?.user?.bio || "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name ?? "",
        image: session.user.image ?? null,
        email: session.user.email ?? "",
        phone: session.user.phone ?? "",
        company: session.user.company ?? "",
        bio: session.user.bio ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  useEffect(() => {
    if (previewUrl && session?.user?.image) {
      URL.revokeObjectURL(previewUrl);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(null);
    }
  }, [session?.user?.image, previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function onSubmit(data: ProfileFormValues) {
    await updateProfile.mutateAsync({
      name: data.name,
      company: data.company,
      bio: data.bio,
      phone: data.phone,
    });
    toast.success("Profile updated successfully.");
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      await uploadAvatar.mutateAsync(file);
    } catch {
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    } finally {
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const deleteAvatar = async () => {
    await deleteAvatarMutation.mutateAsync();
    form.setValue("image", null, { shouldDirty: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-6">
          <Skeleton className="h-25 w-25 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="mt-2 h-8 w-32" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center gap-6">
                  <div className="group relative">
                    <Avatar className="h-25 w-25">
                      <AvatarImage src={previewUrl ?? field.value ?? undefined} />
                      <AvatarFallback className="text-xl">{getDisplayNameInitials(session?.user?.name ?? "")}</AvatarFallback>
                    </Avatar>
                    <FormLabel
                      htmlFor="image"
                      className={`absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 ${isUploading ? "opacity-100" : ""}`}
                    >
                      {isUploading ? (
                        <Loader className="h-6 w-6 animate-spin text-white" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </FormLabel>

                    <Input
                      ref={avatarInputRef}
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                  </div>

                  <div className="space-y-1">
                    <FormLabel>Profile picture</FormLabel>
                    <FormDescription>Click on the avatar to upload a new profile picture.</FormDescription>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        disabled={isUploading}
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        {field.value ? "Change avatar" : "Upload avatar"}
                      </Button>

                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-destructive hover:text-destructive"
                          onClick={deleteAvatar}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>Name will be displayed on your profile.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" disabled {...field} />
              </FormControl>
              <FormDescription>Please contact support to change your email address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <PhoneInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormDescription>Enter your phone number with country code.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="Company name" {...field} />
              </FormControl>
              <FormDescription>Enter your company name to update your profile.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
              </FormControl>
              <FormDescription>You can describe yourself in a few words.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={updateProfile.isPending}
          aria-busy={updateProfile.isPending}
          className="self-start"
        >
          Update profile
        </Button>
      </form>
    </Form>
  );
}
