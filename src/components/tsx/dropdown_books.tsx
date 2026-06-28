"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./components.module.css";
import { useChartTheme } from "../../hooks/use_chart_theme";
import { useHomeData } from "../../context/home_context";
import { useYearData } from "../../context/year_context";

function DropdownBooks() {
  const {
    chartProps,
    availableTCC,
    activeTCC,
    selectedLabel,
    setSelectedLabel,
    getMetadata,
  } = useHomeData();

  const { chartColor } = chartProps;
  const { setNeedUpdateEAP } = useYearData();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { colorMap, tabColor, textColor } = useChartTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdown_container} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.dropdown_button}
      >
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: "14px",
          }}
        >
          Prova:{" "}
          <span style={{ color: chartColor }}>
            {activeTCC?.metadata?.cor ?? "..."}
          </span>
        </span>
        <span
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "0.2s",
          }}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className={styles.dropdown_list}>
          {availableTCC?.map((ds) => {
            const info = getMetadata(ds.metadata.codigo, ds.metadata.lingua);
            const isSelected = selectedLabel === ds.label;
            return (
              <div
                key={ds.label}
                onClick={() => {
                  setSelectedLabel(ds.label);
                  setIsOpen(false);
                  setNeedUpdateEAP(true);
                }}
                className={styles.dropdown_list_item}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  backgroundColor: isSelected ? tabColor : "transparent",
                  color: isSelected
                    ? colorMap[info.corNome] || "#475569"
                    : textColor,
                  borderLeft:
                    isSelected && colorMap
                      ? `4px solid ${colorMap[info.corNome]}` || "#475569"
                      : "transparent",
                }}
              >
                {info.fullText}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DropdownBooks;
