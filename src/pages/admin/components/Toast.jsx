import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info } from "lucide-react";

const ICON = { success: CheckCircle, error: XCircle, info: Info };
const CLS  = { success: "ad-toast--success", error: "ad-toast--error", info: "ad-toast--info" };

/**
 * Toast — auto-dismissing notification.
 * Props: { toast: { id, type, message }, onClose }
 */
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onClose(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  const Icon = ICON[toast?.type] ?? Info;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className={`ad-toast ${CLS[toast.type] ?? "ad-toast--info"}`}
          initial={{ opacity: 0, y: 20, scale: .95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: .95 }}
          transition={{ duration: 0.2 }}
          role="alert"
        >
          <Icon size={18} />
          <span>{toast.message}</span>
          <button
            onClick={() => onClose(toast.id)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: "auto", opacity: .8, fontSize: "1rem" }}
            aria-label="Dismiss"
          >✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
