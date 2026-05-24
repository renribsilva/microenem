import { useEffect, useRef, useState } from "react";
import styles from "./components.module.css";
import { useChartTheme } from "../../hooks/use_chart_theme";
import { useHomeData } from "../../context/home_context";

export default function Dropdown() {
  const { chartLogic, activeTCC, selectedLabel, setSelectedLabel } =
    useHomeData();
  const { chartColor, availableTCC, getInfoCaderno } = chartLogic;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { colorMap, gridColor, tickColor } = useChartTheme();

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
          }}
        >
          Prova:{" "}
          <span style={{ color: chartColor }}>{activeTCC?.metadata?.cor}</span>
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
          {availableTCC?.map((ds: any) => {
            const info = getInfoCaderno(ds.metadata.codigo, ds.metadata.lingua);
            const isSelected = selectedLabel === ds.label;
            return (
              <div
                key={ds.label}
                onClick={() => {
                  setSelectedLabel(ds.label);
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  backgroundColor: isSelected ? gridColor : "transparent",
                  color: isSelected
                    ? colorMap[info.corNome] || "#475569"
                    : tickColor,
                  borderLeft: `4px solid ${isSelected ? colorMap[info.corNome] || "#475569" : "transparent"}`,
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
