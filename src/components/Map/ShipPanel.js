
import React from 'react';

const ShipPanel = ({ ships }) => {
  return (
    <div className="ship-panel">
      <h3>Ships Visiting the Port</h3>
      <ul>
        {ships.map((ship) => (
          <li key={ship.id}>{ship.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ShipPanel;
