import { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Redo2, SendHorizonal, Undo2 } from "lucide-react";
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
  onSend?(previewUrl: string): void | Promise<void>;
}

function Tool({ id }: { id: string }) {
  const tools = useTools();
  const isSelected = useIsToolSelected(tools[id]);

  return <TldrawUiMenuItem {...tools[id]} isSelected={isSelected} />;
}

export function Toolbar({ onSend }: ToolbarProps) {
  const editor = useEditor();
  const { SendConfirmModal, setShowSendConfirmModal } = useSendConfirmModal();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    editor.setCurrentTool("draw");
  }, [editor]);

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
    await onSend?.(previewUrl || "");

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
            {/* <Tool id="select" /> */}
            {/* <Tool id="hand" /> */}
            <button
              className="tlui-button tlui-button__tool"
              onClick={() => editor.undo()}
              title="回到上一步"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              className="tlui-button tlui-button__tool"
              onClick={() => editor.redo()}
              title="重做"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <Tool id="draw" />
            <Tool id="eraser" />
            <div className="border-r border-gray-300 h-6 mx-2" />
            <button
              className="tlui-button tlui-button__tool"
              onClick={handleshowSendConfirm}
              title="送出"
            >
              <SendHorizonal className="w-4 h-4 text-[#06c755]" />
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
