import React, { useState } from "react";
import NewMarket from "../components/NewMarket";
import MarketList from "../components/MarketList";
import { API, graphqlOperation } from "aws-amplify";
import { searchMarkets } from "../graphql/queries";

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

  const handleSearch = async (event) => {
    try {
      event.preventDefault();
      setIsSearching(true);
      console.log(searchTerm);
      const result = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: searchTerm } },
              { owner: { match: searchTerm } },
              { tags: { match: searchTerm } },
            ],
          },
          sort: {
            field: "createdAt",
            direction: "desc",
          },
        })
      );

      setSearchResults(result.data.searchMarkets.items);
      setIsSearching(false);
    } catch (error) {
      console.error(error);
    }
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
      <MarketList searchResults={searchResults} searchTerm={searchTerm} />
    </>
  );
};

export default HomePage;
