// SearchBar.js
import React, { useState } from "react";
import "./SearchHeader.css";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="SearchBar">
    <h6 className="mission">Operation Oceans Eye</h6>
    <img className="aeroImage1" src={`${process.env.PUBLIC_URL}/images/aeroplane.png`} alt="Aeroplane" />
      <input
        className="InputBar"
        type="text"
        placeholder="Enter the Ship name to locate..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button className="SearchButton" onClick={handleSearch}>
        Locate
      </button>
      <img className="aeroImage2" src={`${process.env.PUBLIC_URL}/images/aeroplane.png`} alt="Aeroplane" />
    </div>
  );
};

export default SearchBar;
