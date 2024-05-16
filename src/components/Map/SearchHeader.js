// SearchBar.js
import React, { useState } from 'react';
import "./SearchHeader.css"

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className='SearchBar'>
      <input
      className='InputBar'
        type="text"
        placeholder="Enter the Ship name to locate..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button className='SearchButton' onClick={handleSearch}>Submit</button>
    </div>
  );
};

export default SearchBar;