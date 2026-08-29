"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
  actionType: "reject" | "deactivate" | null;
}

const rejectReasons = [
  "Amejisajiri kimakosa",
  "Taarifa si sahihi",
  "Amejisajiliwa bila ridhaa",
  "Sababu nyingine",
];

const deactivateReasons = [
  "Amehama",
  "Ametengwa ushirika",
  "Amefariki",
  "Amepotea",
  "Sababu nyingine",
];

export default function ReasonModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  actionType,
}: Props) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Choose reasons based on action
  const reasons =
    actionType === "reject"
      ? rejectReasons
      : deactivateReasons;

  // Reset when modal opens/closes or action changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedReason("");
      setCustomReason("");
    }
  }, [isOpen, actionType]);

  const handleSubmit = () => {
    const finalReason =
      selectedReason === "Sababu nyingine"
        ? customReason
        : selectedReason;

    if (!finalReason.trim()) return;

    onConfirm(finalReason);
  };

  const title =
    actionType === "reject"
      ? "Sababu ya Kukataa Mshirika"
      : "Sababu ya Kuondoa Mshirika";

  const confirmText =
    actionType === "reject"
      ? "Kataa"
      : "Deactive";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className="
              w-full max-w-md
              rounded-lg
              bg-white
              p-6
              shadow-lg
              text-gray-800
              dark:bg-gray-900
              dark:text-white/90
            "
          >
            {/* Title */}
            <Dialog.Title
              className="
                mb-4
                text-lg
                font-bold
                text-gray-800
                dark:text-white/90
              "
            >
              {title}
            </Dialog.Title>

            {/* Description */}
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {actionType === "reject"
                ? "Chagua sababu ya kukataa usajili wa mshirika."
                : "Chagua sababu ya kuondoa mshirika kwenye hali ya active."}
            </p>

            {/* Reasons */}
            <div className="space-y-3">
              {reasons.map((reason) => (
                <label
                  key={reason}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-3
                    rounded-md
                    border
                    border-gray-200
                    p-3
                    hover:bg-gray-50
                    dark:border-gray-700
                    dark:hover:bg-white/[0.05]
                  "
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) =>
                      setSelectedReason(e.target.value)
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            {/* Custom reason */}
            {selectedReason === "Sababu nyingine" && (
              <textarea
                className="
                  mt-3
                  w-full
                  rounded
                  border
                  border-gray-300
                  bg-white
                  p-2
                  text-gray-800
                  placeholder:text-gray-400
                  dark:border-gray-700
                  dark:bg-gray-800
                  dark:text-white/90
                  dark:placeholder:text-gray-500
                "
                rows={3}
                placeholder="Andika sababu..."
                value={customReason}
                onChange={(e) =>
                  setCustomReason(e.target.value)
                }
              />
            )}

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="
                  rounded
                  border
                  border-gray-300
                  px-4
                  py-2
                  text-gray-700
                  hover:bg-gray-50
                  disabled:opacity-50
                  dark:border-gray-700
                  dark:text-gray-300
                  dark:hover:bg-white/[0.05]
                "
              >
                Ghairi
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !selectedReason ||
                  (selectedReason === "Sababu nyingine" &&
                    !customReason.trim())
                }
                className={`
                  rounded
                  px-4
                  py-2
                  text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  ${
                    actionType === "reject"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }
                `}
              >
                {loading
                  ? "Inatumika..."
                  : confirmText}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}