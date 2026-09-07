import { BsSearch } from "react-icons/bs";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  ariaLabel = "Search",
}) {
  return (
    <div className="search-wrapper">
      <BsSearch className="search-icon" aria-hidden="true" />
      <input
        type="search"
        className="search-input"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </div>
  );
}
