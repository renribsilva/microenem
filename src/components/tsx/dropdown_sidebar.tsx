import { useEffect, useRef } from "react";
import styles from "./components.module.css";
import { useHomeData } from "../../context/home_context";
import Link from "next/link";
import { useSidebar } from "../../context/sidebar_context";

type YearItem = {
  name: string;
};

interface DropdownSidebarProps {
  handleItemClick: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const years: YearItem[] = [
  { name: "2025" },
  { name: "2024" },
  { name: "2023" },
  { name: "2022" },
  { name: "2021" },
  { name: "2020" },
  { name: "2019" },
];

function DropdownSidebar({
  handleItemClick,
  isOpen,
  setIsOpen,
}: DropdownSidebarProps) {
  const { currentYear, pathName } = useHomeData();
  const { isMobileOpen, isMobile } = useSidebar();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getYearDestinationPath = (targetYear: string) => {
    if (!pathName) return `/${targetYear}/visao-geral`;
    const yearRegex = /^\/\d{4}/;
    if (yearRegex.test(pathName)) {
      return pathName.replace(yearRegex, `/${targetYear}`);
    }
    return `/${targetYear}/visao-geral`;
  };

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
  }, [isOpen, setIsOpen]);

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
            fontSize: "16px",
          }}
        >
          Edição: {currentYear || "2025"}
        </span>
        {(isMobileOpen || !isMobile) && (
          <span
            style={{
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "0.2s",
            }}
          >
            ▼
          </span>
        )}
      </button>
      {isOpen && (
        <div className={styles.dropdown_list}>
          {years.map((ds) => {
            return (
              <Link
                key={ds.name}
                href={getYearDestinationPath(ds.name)}
                onClick={() => {
                  setIsOpen(false);
                  handleItemClick();
                }}
                className={styles.dropdown_list_item}
                style={{
                  display: "block", // Garante que o Link ocupe a linha toda
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {ds.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DropdownSidebar;
