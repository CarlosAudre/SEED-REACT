import React from "react";

function Submit({ label, className }) {
  return (
    <button type="submit" className={className ? className : "submit-button"}>
      {label}
    </button>
  );
}

export default Submit;
