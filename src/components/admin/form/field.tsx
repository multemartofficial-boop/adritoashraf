import { cn } from "@/lib/utils";
import { Panel } from "../panel";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="text-xs text-admin-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-admin-muted">{hint}</p>
      )}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Panel className={cn("p-5 md:p-6", className)}>
      <div className="mb-5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-admin-muted">{description}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </Panel>
  );
}

/** Props helper so inputs announce their error message to screen readers. */
export const errProps = (id: string, error?: string) => ({
  id,
  name: id,
  "aria-invalid": Boolean(error) || undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});
