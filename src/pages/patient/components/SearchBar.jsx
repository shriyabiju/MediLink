import { useState } from "react";

const SearchBar = ({ placeholder = "Search...", onSearch }) => {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    setValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: "#F1F5F9",
      borderRadius: "12px",
      padding: "10px 16px",
      marginBottom: "14px",
    }}>
      <span style={{ fontSize: "16px", color: "#94A3B8" }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          border: "none",
          background: "transparent",
          outline: "none",
          fontSize: "14px",
          color: "#1E293B",
          width: "100%",
        }}
        aria-label={placeholder}
      />
    </div>
  );
};

export default SearchBar;
