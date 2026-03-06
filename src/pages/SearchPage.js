import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from '../components/Search/SearchBar';
import UserCard from '../components/Search/UserCard';

const SearchPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setSearchPerformed(true);
    
    try {
      const params = new URLSearchParams();
      if (searchParams.name) params.append('name', searchParams.name);
      if (searchParams.district) params.append('district', searchParams.district);
      
      const res = await axios.get(`http://localhost:5000/api/users/search?${params}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <SearchBar onSearch={handleSearch} />
      
      <div className="search-results">
        {loading ? (
          <div className="loading">Searching...</div>
        ) : searchPerformed ? (
          users.length > 0 ? (
            users.map(user => (
              <UserCard key={user._id} user={user} />
            ))
          ) : (
            <p className="no-results">No users found</p>
          )
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;