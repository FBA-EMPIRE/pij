export function Field({ name, label, defaultValue = "", type = "text", required = false }: { name: string; label: string; defaultValue?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
      />
    </div>
  );
}

export function TextareaField({ name, label, defaultValue = "" }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none"
      />
    </div>
  );
}

export function SelectField({ name, label, defaultValue, options }: { name: string; label: string; defaultValue?: string; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue ?? options[0]?.value}
        className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}
