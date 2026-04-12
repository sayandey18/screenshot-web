import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showSubmittedData } from "@/lib/show-data";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Trash2 } from "lucide-react";

const profileFormSchema = z.object({
  image: z.string().optional(),
  name: z
    .string("Please enter your name.")
    .min(3, "Name must be at least 3 characters.")
    .max(15, "Name must not be longer than 15 characters."),
  email: z.email("Please enter a valid email address."),
  company: z.string().optional(),
  bio: z.string().max(160).min(4).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  bio: "I own a computer.",
};

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => showSubmittedData(data))} className="space-y-8">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-25 w-25">
                      <AvatarImage src={field.value || ""} />
                      <AvatarFallback className="text-xl">
                        {form.watch("name")?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <FormLabel
                      htmlFor="image"
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 opacity-0 transition-opacity cursor-pointer group-hover:opacity-100">
                      <Camera className="h-6 w-6 text-white" />
                    </FormLabel>

                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        // Optional local preview
                        const previewUrl = URL.createObjectURL(file)
                        field.onChange(previewUrl)

                        // TODO: Replace with actual upload logic
                        // const uploadedUrl = await uploadAvatar(file)
                        // field.onChange(uploadedUrl)
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <FormLabel>Profile picture</FormLabel>
                    <FormDescription>
                      Click on the avatar to upload a new profile picture.
                    </FormDescription>

                    <div className="flex items-center gap-2">
                      <FormLabel htmlFor="image">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          asChild
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
                          onClick={() => field.onChange("")}
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
              <FormDescription>
                Name will be displayed on your profile.
              </FormDescription>
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
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormDescription>
                Enter your email address to update your profile.
              </FormDescription>
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
              <FormDescription>
                Enter your company name to update your profile.
              </FormDescription>
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
              <FormDescription>
                You can describe yourself in a few words.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
}
