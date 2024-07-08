"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";

import FocusTrap from "focus-trap-react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { createPortal } from "react-dom";

interface ModalProps {
  children: React.ReactNode;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  bgColor?: string;
  closeWithX?: boolean;
  onClose?(): void;
}

function _Modal({
  children,
  showModal,
  setShowModal,
  bgColor = "bg-white",
  closeWithX,
  onClose,
}: ModalProps) {
  const mobileModalRef = useRef<HTMLDivElement>(null);
  const desktopModalRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(
    (closeWithX?: boolean) => {
      onClose?.();
      if (closeWithX) {
        return;
      } else {
        setShowModal(false);
      }
    },
    [onClose, setShowModal],
  );

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && !closeWithX) {
      setShowModal(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const controls = useAnimation();
  const transitionProps = { type: "spring", stiffness: 500, damping: 30 };
  useEffect(() => {
    controls.start({
      y: 0,
      transition: transitionProps,
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleDragEnd(_: unknown, info: any) {
    if (!mobileModalRef.current) return;

    const offset = info.offset.y;
    const velocity = info.velocity.y;
    const height = mobileModalRef.current.getBoundingClientRect().height;
    if (offset > height / 2 || velocity > 800) {
      await controls.start({ y: "100%", transition: transitionProps });
      closeModal();
    } else {
      controls.start({ y: 0, transition: transitionProps });
    }
  }

  return (
    <AnimatePresence>
      {showModal && (
        <FocusTrap focusTrapOptions={{ initialFocus: false }}>
          <div className="absolute">
            <motion.div
              ref={mobileModalRef}
              key="mobile-modal"
              className="group fixed inset-x-0 bottom-0 z-40 w-screen cursor-grab active:cursor-grabbing sm:hidden"
              initial={{ y: "100%" }}
              animate={controls}
              exit={{ y: "100%" }}
              transition={transitionProps}
              drag="y"
              dragDirectionLock
              onDragEnd={handleDragEnd}
              dragElastic={{ top: 0, bottom: 1 }}
              dragConstraints={{ top: 0, bottom: 0 }}
            >
              <div
                className={`h-7 ${bgColor} rounded-t-4xl -mb-1 flex w-full items-center justify-center border-t border-gray-200`}
              >
                <div className="-mr-1 h-1 w-6 rounded-full bg-gray-300 transition-all group-active:rotate-12" />
                <div className="h-1 w-6 rounded-full bg-gray-300 transition-all group-active:-rotate-12" />
              </div>
              {children}
            </motion.div>
            <motion.div
              ref={desktopModalRef}
              key="desktop-modal"
              className="fixed inset-0 z-40 hidden min-h-screen items-center justify-center sm:flex"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onMouseDown={(e) => {
                if (desktopModalRef.current === e.target) {
                  closeModal(closeWithX);
                }
              }}
            >
              {children}
            </motion.div>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-30 bg-gray-100 bg-opacity-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => closeModal(closeWithX)}
              style={{ backdropFilter: "blur(4px)" }}
            />
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}

export function Modal(props: ModalProps) {
  return createPortal(<_Modal {...props} />, document.body);
}
