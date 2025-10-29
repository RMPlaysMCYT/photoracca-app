import React from "react";

import "./css/buttons.css";

export default function Buttons(
    {
        types = primary,
        onClick,
        children
    }
) {
    const classItemName = 'btn btn-${types'
    return (
        <button> className={classItemName} onClick={onClick}
            {children}
        </button>
    );
}