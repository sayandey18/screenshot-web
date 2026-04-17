import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const profileFormSchema = z.object({
  image: z.string().nullable().optional(),
  name: z
    .string("Please enter your name.")
    .min(3, "Name must be at least 3 characters.")
    .max(15, "Name must not be longer than 15 characters."),
  email: z.email("Please enter a valid email address."),
  company: z.string().optional(),
  bio: z.string().max(160).min(4).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const [isUploading, setIsUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const session = useAuthStore((s) => s.session);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
      image: session?.user?.image || null,
      email: session?.user?.email || "",
      company: session?.user?.company || "",
      bio: session?.user?.bio || "",
    },
    // mode: "onChange",
  });

  useEffect(() => {
    if (session) {
      form.setValue("image", session?.user?.image || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.image]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const { error } = await authClient.updateUser({
        name: data.name,
        company: data.company,
        bio: data.bio,
      });
      if (error) throw error;
      await useAuthStore.getState().fetchSession();
      toast.success("Profile updated successfully.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile. Please try again.");
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/profile/avatar", formData);
      form.setValue("image", data.user?.avatarUrl);
      await useAuthStore.getState().fetchSession();
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload avatar.");
    } finally {
      setIsUploading(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const deleteAvatar = async () => {
    setIsUploading(true);
    try {
      await api.delete("/profile/avatar");
      form.setValue("image", null, { shouldDirty: true });
      await useAuthStore.getState().fetchSession();
    } catch (error: any) {
      toast.error(error?.message || "Failed to remove avatar.");
    } finally {
      setIsUploading(false);
    }
  };

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
                      {field.value && <AvatarImage src={field.value} />}
                      <AvatarFallback className="text-xl">
                        {form.watch("name")?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
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
                      <FormLabel htmlFor="image">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          disabled={isUploading}
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          <span>Change avatar</span>
                        </Button>
                      </FormLabel>

                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={deleteAvatar}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
        {/* Make email as input area */}
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
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
}
