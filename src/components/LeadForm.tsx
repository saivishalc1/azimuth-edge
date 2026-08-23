import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitLead } from "@/lib/data";

type FieldKey = "property_address" | "property_type" | "program";

export function LeadForm({
  source,
  extraFields = [],
  programOptions,
  propertyTypeOptions = ["Multifamily", "Mixed-Use", "Retail", "Office", "Industrial", "Land", "Other"],
  submitLabel = "Send message",
  title,
  description,
}: {
  source: string;
  extraFields?: FieldKey[];
  programOptions?: readonly string[];
  propertyTypeOptions?: string[];
  submitLabel?: string;
  title?: string;
  description?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    property_address: "",
    property_type: "",
    program: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        property_address: extraFields.includes("property_address") ? form.property_address || null : null,
        property_type: extraFields.includes("property_type") ? form.property_type || null : null,
        program: extraFields.includes("program") ? form.program || null : null,
        message: form.message || null,
        source,
      }),
    onSuccess: () => {
      toast.success("Thank you — your message is on its way.", {
        description: "John will follow up within one business day.",
      });
      setForm({ name: "", email: "", phone: "", property_address: "", property_type: "", program: "", message: "" });
    },
    onError: () => toast.error("Something went wrong. Please try again or call the office."),
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <form
      className="surface-card p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      {title ? <h3 className="font-display text-xl font-semibold">{title}</h3> : null}
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${source}-name`}>Name</Label>
          <Input id={`${source}-name`} required value={form.name} onChange={set("name")} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${source}-email`}>Email</Label>
          <Input
            id={`${source}-email`}
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${source}-phone`}>Phone</Label>
          <Input id={`${source}-phone`} value={form.phone} onChange={set("phone")} autoComplete="tel" />
        </div>

        {extraFields.includes("property_address") ? (
          <div className="space-y-2">
            <Label htmlFor={`${source}-address`}>Property address</Label>
            <Input id={`${source}-address`} value={form.property_address} onChange={set("property_address")} />
          </div>
        ) : null}

        {extraFields.includes("property_type") ? (
          <div className="space-y-2">
            <Label htmlFor={`${source}-type`}>Property type</Label>
            <select
              id={`${source}-type`}
              value={form.property_type}
              onChange={(e) => setForm((p) => ({ ...p, property_type: e.target.value }))}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select a type</option>
              {propertyTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {extraFields.includes("program") ? (
          <div className="space-y-2">
            <Label htmlFor={`${source}-program`}>Program of interest</Label>
            <select
              id={`${source}-program`}
              value={form.program}
              onChange={(e) => setForm((p) => ({ ...p, program: e.target.value }))}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select a program</option>
              {(programOptions ?? []).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="Not sure yet">Not sure yet</option>
            </select>
          </div>
        ) : null}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${source}-message`}>Message</Label>
          <Textarea id={`${source}-message`} rows={5} value={form.message} onChange={set("message")} />
        </div>
      </div>

      <Button type="submit" variant="gold" size="lg" className="mt-6 w-full sm:w-auto" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
