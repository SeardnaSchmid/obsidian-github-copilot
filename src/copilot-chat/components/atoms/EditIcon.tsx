import React from "react";

interface EditIconProps {
  onClick: () => void;
  title?: string;
  className?: string;
}

const EditIcon: React.FC<EditIconProps> = ({ onClick, title = "Edit message", className }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={className}
    style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  </button>
);

export default EditIcon;
