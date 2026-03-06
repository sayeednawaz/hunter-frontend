import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    district: ''
  });

  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="search-inputs">
          <input
            type="text"
            name="name"
            placeholder="Search by name..."
            value={searchParams.name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="district"
            placeholder="Search by district..."
            value={searchParams.district}
            onChange={handleChange}
          />
          <button type="submit">Search</button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;