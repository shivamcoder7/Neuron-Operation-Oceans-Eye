import React from "react";
import "./ShipPanel.css";

const ShipPanel = ({ ships }) => {
  console.log(ships);
  return (
    <div className="ship-panel">
      <h3>Ships Visiting the Port</h3>
      <ul>
        {ships.map((ship) => (
          <li key={ship.id}>{ship}</li>
        ))}
      </ul>
    </div>
  );
};

export default ShipPanel;
