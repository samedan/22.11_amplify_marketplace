import React, { useState } from "react";
import NewMarket from "../components/NewMarket";
import MarketList from "../components/MarketList";

// class HomePage extends React.Component {
const HomePage = () => {
  // state = {};
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = (searchTerm) => {
    setSearchTerm(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    console.log(searchTerm);
  };
  return (
    <>
      <NewMarket
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        handleClearSearch={handleClearSearch}
        handleSearch={handleSearch}
        isSearching={isSearching}
      />
      <MarketList />
    </>
  );
};

export default HomePage;
