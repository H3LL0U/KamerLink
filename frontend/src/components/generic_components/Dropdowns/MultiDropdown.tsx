import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { defaultScheme, type ColorScheme } from "../../../main";

interface MultiDropdownProps<T extends string> {
  options: readonly T[]; // list of allowed values
  onSelect: (values: T[]) => void; // callback with all selected values
  placeholder?: string; // optional placeholder shown when nothing is selected
  style?: React.CSSProperties;
  scheme?: ColorScheme;
  selectAllOption?: T; // special option treated as "select all"
}

function MultiDropdown<T extends string>({
  options,
  onSelect,
  placeholder = "Select options",
  style = {},
  scheme = defaultScheme,
  selectAllOption,
}: MultiDropdownProps<T>) {
  const [selected, setSelected] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>();

  useEffect(() => {
    onSelect(selected);
  }, [selected, onSelect]);

  const toggleOption = (option: T) => {
    if (option === selectAllOption) {
      if (selected.includes(option)) {
        setSelected([]);
      } else {
        setSelected([...options]);
      }
    } else {
      setSelected((prev) => {
        const newSelected = prev.includes(option)
          ? prev.filter((v) => v !== option)
          : [...prev, option];

        // Automatically select "Alle tag" if all are selected
        if (selectAllOption && newSelected.length === options.length - 1 && !newSelected.includes(selectAllOption)) {
          newSelected.push(selectAllOption);
        }
        // Remove "Alle tag" if not all are selected
        if (selectAllOption && newSelected.includes(selectAllOption) && newSelected.length < options.length) {
          newSelected.splice(newSelected.indexOf(selectAllOption), 1);
        }
        return newSelected;
      });
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine trigger width based on longest option or placeholder
  useLayoutEffect(() => {
    if (!triggerRef.current) return;
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.whiteSpace = "nowrap";
    span.style.font = getComputedStyle(triggerRef.current).font;
    const allTexts = [...options, placeholder];
    let maxWidth = 0;
    allTexts.forEach((text) => {
      span.textContent = text;
      document.body.appendChild(span);
      maxWidth = Math.max(maxWidth, span.offsetWidth);
      document.body.removeChild(span);
    });
    setTriggerWidth(maxWidth + 32); // padding adjustment
  }, [options, placeholder]);

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block", ...style }}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        style={{
          width: triggerWidth ? `${triggerWidth}px` : "auto",
          padding: "8px 12px",
          borderRadius: "6px",
          border: `1px solid ${scheme.third}`,
          backgroundColor: scheme.first,
          color: scheme.fourth,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {selected.length > 0 ? selected.join(", ") : placeholder}
      </div>

      {/* Options */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: "200px",
            overflowY: "auto",
            backgroundColor: scheme.first,
            border: `1px solid ${scheme.third}`,
            borderRadius: "6px",
            marginTop: "4px",
            zIndex: 1000,
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          }}
        >
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => toggleOption(option)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                backgroundColor: selected.includes(option) ? scheme.second : scheme.first,
                color: scheme.fourth,
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                readOnly
                style={{ marginRight: "8px" }}
              />
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultiDropdown;
