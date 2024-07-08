import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { SendHorizonal } from "lucide-react";
import {
  DefaultToolbar,
  TldrawUiMenuItem,
  exportToBlob,
  useEditor,
  useIsToolSelected,
  useTools,
} from "tldraw";

import { useSendConfirmModal } from "./send-confirm-modal";

interface ToolbarProps {
  onSend?(): void | Promise<void>;
}

export function Toolbar({ onSend }: ToolbarProps) {
  const editor = useEditor();
  const tools = useTools();
  const isDrawing = useIsToolSelected(tools.draw);
  const isErasing = useIsToolSelected(tools.eraser);
  const { SendConfirmModal, setShowSendConfirmModal } = useSendConfirmModal();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);

  const handleshowSendConfirm = async () => {
    setIsSending(true);

    // generate preview image
    let blob = null;
    try {
      blob = await exportToBlob({
        editor,
        format: "png",
        ids: [...editor.getCurrentPageShapeIds()],
      });
    } catch {
      // do nothing
    }
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return blob ? URL.createObjectURL(blob) : null;
    });

    // show modal
    setShowSendConfirmModal(true);
  };

  const handleSend = async () => {
    await onSend();

    setIsSending(false);
    setShowSendConfirmModal(false);
  };

  return (
    <AnimatePresence>
      {!isSending && (
        <motion.div
          key="toolbar"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <DefaultToolbar>
            <TldrawUiMenuItem {...tools.draw} isSelected={isDrawing} />
            <TldrawUiMenuItem {...tools.eraser} isSelected={isErasing} />
            <button
              className="tlui-button tlui-button__tool"
              onClick={handleshowSendConfirm}
              title="送出"
            >
              <SendHorizonal className="w-4 h-4 text-[#4F4F4F]" />
            </button>
          </DefaultToolbar>
        </motion.div>
      )}
      <SendConfirmModal
        onCancel={() => setIsSending(false)}
        onConfirm={handleSend}
        previewUrl={previewUrl}
      />
    </AnimatePresence>
  );
}
