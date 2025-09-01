"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Upload, Bug, Lightbulb, Mail, Loader2, X, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const schema = z.object({
  kind: z.enum(["bug", "error", "idea"]),
  title: z.string().min(3, "Give it a short title"),
  details: z.string().min(10, "A bit more detail helps a lot"),
  email: z.string().email().optional().or(z.literal("")),
  files: z
    .array(
      z.custom<File>((v) => v instanceof File && v.size > 0, "Invalid file")
    )
    .max(4, "Up to 4 screenshots max")
    .optional(),
  // Honeypot (bots fill this)
  website: z.string().max(0).optional(),
  agree: z.boolean().refine((v) => v === true, "Please confirm you’re okay with us contacting you if needed"),
})

type FormValues = z.infer<typeof schema>

export default function ContributeSection({
  id = "contribute",
  headline = "Contribute feedback",
  subhead = "Report a bug, attach a screenshot, or suggest an idea. Help shape the roadmap.",
  className,
}: {
  id?: string
  headline?: string
  subhead?: string
  className?: string
}) {
  const [previews, setPreviews] = React.useState<string[]>([])
  const [dragActive, setDragActive] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle")
  const [serverMsg, setServerMsg] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: "bug",
      title: "",
      details: "",
      email: "",
      files: [],
      website: "", // honeypot
      agree: true,
    },
  })

  const files = watch("files") || []
  const kind = watch("kind")
  const title = watch("title")
  const email = watch("email")

  React.useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  function addFiles(newFiles: FileList | File[]) {
    const current = watch("files") || []
    const next = [...current, ...Array.from(newFiles)].slice(0, 4)
    setValue("files", next, { shouldValidate: true })
  }

  function removeFile(index: number) {
    const current = watch("files") || []
    const next = current.filter((_, i) => i !== index)
    setValue("files", next, { shouldValidate: true })
  }

  async function onSubmit(values: FormValues) {
    // Honeypot check client-side as well
    if (values.website && values.website.length > 0) {
      toast.error("Submission blocked.")
      return
    }

    const fd = new FormData()
    fd.append("kind", values.kind)
    fd.append("title", values.title)
    fd.append("details", values.details)
    fd.append("email", values.email || "")
    fd.append("agree", values.agree ? "true" : "false")
      ; (values.files || []).forEach((file) => fd.append("files", file))

    let res: Response | null = null
    try {
      res = await fetch("/api/contribute", { method: "POST", body: fd })
    } catch (e) {
      toast.error("Network error. Please try again.")
      setStatus("error")
      setServerMsg("Network error")
      return
    }

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Unknown error" }))
      toast.error(error || "Something went wrong.")
      setStatus("error")
      setServerMsg(error || "Unknown error")
      return
    }

    // try to read any server message/id but don't depend on it
    const data = await res.json().catch(() => ({} as any))
    setServerMsg(data?.message || null)

    toast.success("Thanks! Your submission was received.")
    setStatus("success")
    setPreviews([])
    // Keep values available for success summary; we'll hard reset when "Send another" is clicked
  }

  function resetAll() {
    reset()
    setPreviews([])
    setStatus("idle")
    setServerMsg(null)
  }

  return (
    <section id={id} className={cn("w-full pt-20 md:pt-14 md:pb-30 scroll-mt-[var(--header-height)]", className)}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-3xl px-4"
      >
        <div className="mb-8 text-center">
          <Badge variant="outline" className="mb-3">CTA Form</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{headline}</h2>
          <p className="mt-3 text-muted-foreground">{subhead}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Send feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* ARIA live region for status updates */}
            <div className="sr-only" role="status" aria-live="polite">
              {status === "success" && "Submission received successfully."}
              {status === "error" && `Submission failed. ${serverMsg ?? ""}`}
            </div>

            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center gap-4 py-6"
              >
                <CheckCircle2 className="h-14 w-14 text-green-600" aria-hidden />
                <div>
                  <h3 className="text-xl font-semibold">Thanks, we’ve got it! 🎉</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {serverMsg ?? "We’ll review your submission and reach out if we have any questions."}
                  </p>
                </div>

                <div className="w-full max-w-md grid gap-2 rounded-lg border bg-muted/40 p-4 text-left">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <span className="font-medium capitalize">{kind}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Title:</span>{" "}
                    <span className="font-medium">{title || "—"}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Reply‑to:</span>{" "}
                    <span className="font-medium">{email || "not provided"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={resetAll}>Send another</Button>
                  <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    Back to top
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Type */}
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    defaultValue="bug"
                    onValueChange={(v) => setValue("kind", v as FormValues["kind"], { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">
                        <div className="inline-flex items-center gap-2">
                          <Bug className="h-4 w-4" /> Bug
                        </div>
                      </SelectItem>
                      <SelectItem value="error">
                        <div className="inline-flex items-center gap-2">
                          <Bug className="h-4 w-4" /> Error
                        </div>
                      </SelectItem>
                      <SelectItem value="idea">
                        <div className="inline-flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" /> Idea
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.kind && <p className="text-sm text-destructive">{errors.kind.message}</p>}
                </div>

                {/* Title */}
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Short summary…" {...register("title")} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                {/* Details */}
                <div className="grid gap-2">
                  <Label htmlFor="details">Details</Label>
                  <Textarea
                    id="details"
                    placeholder="What happened? Steps to reproduce? Or describe your idea in detail."
                    rows={6}
                    {...register("details")}
                  />
                  {errors.details && <p className="text-sm text-destructive">{errors.details.message}</p>}
                </div>

                {/* Email (optional) */}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email (optional)
                  </Label>
                  <Input id="email" type="email" placeholder="we’ll reply here if needed" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
                </div>

                {/* File upload */}
                <div className="grid gap-2">
                  <Label>Screenshots (PNG/JPG/WebP, up to 4)</Label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragActive(true)
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragActive(false)
                      addFiles(e.dataTransfer.files)
                    }}
                    className={cn(
                      "rounded-lg border border-dashed p-6 text-center transition-colors",
                      dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30"
                    )}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      className="hidden"
                      id="fileInput"
                      onChange={(e) => e.target.files && addFiles(e.target.files)}
                    />
                    <label htmlFor="fileInput" className="cursor-pointer inline-flex flex-col items-center gap-2">
                      <Upload className="h-5 w-5" />
                      <span className="text-sm text-muted-foreground">
                        Drag & drop or <span className="text-primary underline">browse files</span>
                      </span>
                    </label>
                  </div>

                  {previews.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {previews.map((src, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={src}
                            alt={`screenshot-${i}`}
                            className="h-28 w-full object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="absolute -top-2 -right-2 rounded-full border bg-background p-1 shadow hover:bg-muted"
                            aria-label="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.files && <p className="text-sm text-destructive">{errors.files.message as string}</p>}
                </div>

                {/* Honeypot */}
                <div className="hidden">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="Leave empty" {...register("website")} autoComplete="off" />
                </div>

                {/* Consent */}
                <div className="flex items-center gap-2">
                  <input
                    id="agree"
                    type="checkbox"
                    className="size-4 accent-current"
                    defaultChecked
                    {...register("agree")}
                  />
                  <Label htmlFor="agree" className="text-sm text-muted-foreground">
                    I agree you can review this info and contact me if needed.
                  </Label>
                </div>
                {errors.agree && <p className="text-sm text-destructive">{errors.agree.message}</p>}

                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      "Send feedback"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}
