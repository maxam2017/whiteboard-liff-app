"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { Loader2 } from "lucide-react";

import { Modal } from "../ui/modal";

export function SendConfirmModalHelper({
  showModal,
  setShowModal,
  onConfirm,
  onCancel,
  previewUrl,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  previewUrl?: string | null;
}) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="inline-block w-full transform overflow-hidden bg-white align-middle shadow-xl transition-all sm:max-w-md sm:rounded-2xl sm:border sm:border-gray-200">
        <div className="flex flex-col space-y-2 text-center sm:text-left p-4">
          <h2 className="text-lg font-semibold">傳送至聊天室 💬</h2>
          <p className="text-sm text-muted-foreground">
            確定要將此圖片傳送至聊天室嗎？
            <img
              src={previewUrl || ""}
              className="w-full h-[200px] object-contain md:object-left mt-2"
              width={300}
            />
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2  p-4">
          <button
            type="button"
            className="min-w-[90px] inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-2 sm:mt-0"
            onClick={() => {
              onCancel?.();
              setShowModal(false);
            }}
          >
            取消
          </button>
          <button
            type="button"
            className="min-w-[90px] inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-opacity-95 h-10 px-4 py-2"
            onClick={async () => {
              setSubmitting(true);
              await onConfirm?.();
              setSubmitting(false);
              setShowModal(false);
            }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "確認"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function useSendConfirmModal() {
  const [showSendConfirmModal, setShowSendConfirmModalState] = useState(false);
  const callbackRef = useRef<() => void>();

  const setShowSendConfirmModal = useCallback(
    (show: boolean, cb: () => void = () => {}) => {
      callbackRef.current = cb;
      setShowSendConfirmModalState(show);
    },
    [],
  );

  const SendConfirmModal = useCallback(
    ({
      onConfirm,
      onCancel,
      previewUrl,
    }: {
      onConfirm?(): void | Promise<void>;
      onCancel?(): void;
      previewUrl?: string | null;
    }) => {
      return (
        <SendConfirmModalHelper
          showModal={showSendConfirmModal}
          setShowModal={setShowSendConfirmModalState}
          onConfirm={async () => {
            await onConfirm?.();
            callbackRef.current?.();
            callbackRef.current = undefined;
          }}
          onCancel={onCancel}
          previewUrl={previewUrl}
        />
      );
    },
    [showSendConfirmModal, setShowSendConfirmModalState],
  );

  return useMemo(
    () => ({ setShowSendConfirmModal, SendConfirmModal }),
    [setShowSendConfirmModal, SendConfirmModal],
  );
}
