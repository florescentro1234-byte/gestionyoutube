import { CheckCircle2, X } from 'lucide-react';

export default function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed top-5 left-1/2 z-50 animate-slide-down">
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl shadow-green-500/30 max-w-[90vw]">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
        <span className="text-sm font-semibold whitespace-nowrap">{message}</span>
        <button
          onClick={onClose}
          className="ml-1 p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
          aria-label="Cerrar mensaje"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
