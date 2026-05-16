import { Loader2 } from "lucide-react";

interface LoaderProps {
  label?: string;
}

export default function Loader({ label = "Loading..." }: LoaderProps) {
  return (
    <div className="flex min-h-55 flex-col items-center justify-center rounded-3xl border border-gray-200 bg-slate-50 p-8 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-inner transition-transform duration-300 motion-safe:animate-spin">
        <Loader2 size={28} className="text-blue-600" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
