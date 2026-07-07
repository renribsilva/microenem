"use client";

import { useEffect, useRef } from "react";
import PdfThumbnail from "./pdf_thumbnail";

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  pageNumber: number;
  code: number;
  cropHeight: number;
  cropWidth: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  tituloQuestao?: string;
}

export default function PdfModal({
  isOpen,
  onClose,
  fileUrl,
  pageNumber,
  code,
  cropHeight,
  cropWidth,
  offsetX,
  offsetY,
  scale,
  tituloQuestao,
}: PdfModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.close();
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{
        padding: "14px",
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        border: "1px solid #f3f4f6",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: `calc(100% - 90px)`,
        maxWidth: `max-content`,
        height: `max-content`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontWeight: "bold",
              color: "#1f2937",
              fontSize: "18px",
            }}
          >
            {tituloQuestao || `Questão ${code}`}
          </h3>
          <button
            onClick={onClose}
            style={{
              color: "#888888",
              backgroundColor: "#f3f4f6",
              border: "none",
              fontWeight: "bold",
              fontSize: "14px",
              padding: "4px 12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Fechar
          </button>
        </div>
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <PdfThumbnail
            fileUrl={fileUrl}
            pageNumber={pageNumber}
            cropHeight={cropHeight}
            cropWidth={cropWidth}
            offsetX={offsetX}
            offsetY={offsetY}
            scale={scale}
          />
        </div>
      </div>
    </dialog>
  );
}
