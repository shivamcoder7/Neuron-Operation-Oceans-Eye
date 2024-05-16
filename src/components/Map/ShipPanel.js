import React from "react";
import "./ShipPanel.css";

const ShipPanel = ({ ships, port }) => {
  console.log(ships);
  return (
    <div className="ship-panel">
      <h3>`Ships Visiting the {port} Port`</h3>
      <ul>
        {ships.map((ship) => (
          <li key={ship.id}>{ship}</li>
        ))}
      </ul>
    </div>
  );
};

export default ShipPanel;
