import React, { useState, useEffect } from "react";
import { defaultScheme, type ColorScheme } from "../../../main";

interface DropdownProps<T extends string> {
  options: readonly T[]; // list of allowed values
  onSelect: (value: T) => void; // callback with exact type
  placeholder?: T; // must also be a valid option
  style?: React.CSSProperties;
  scheme?: ColorScheme; // color scheme
}

function Dropdown<T extends string>({
  options,
  onSelect,
  placeholder,
  style = {},
  scheme = defaultScheme,
}: DropdownProps<T>) {
  const [selected, setSelected] = useState<T>(placeholder || options[0]);

  useEffect(() => {
    onSelect(selected);
  }, [selected, onSelect]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as T;
    setSelected(value);
    onSelect(value);
  };

  return (
    <select
      value={selected}
      onChange={handleChange}
      style={{
        padding: "8px 12px",
        borderRadius: "6px",
        border: `1px solid ${scheme.third}`,
        backgroundColor: scheme.first,
        color: scheme.fourth,
        cursor: "pointer",
        outline: "none",
        ...style,
      }}
    >
      {options.map((option, idx) => (
        <option
          key={idx}
          value={option}
          style={{
            backgroundColor: scheme.first,
            color: scheme.fourth,
          }}
        >
          {option}
        </option>
      ))}
    </select>
  );
}

export default Dropdown;
