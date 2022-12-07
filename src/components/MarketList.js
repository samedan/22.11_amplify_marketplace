import React from "react";
import { Loading, Card, Icon, Tag } from "element-react";
import { Connect, Greetings } from "aws-amplify-react";
import { listMarkets } from "../graphql/queries";
import { onCreateMarket } from "../graphql/subscriptions";
import { graphqlOperation } from "aws-amplify";
import Error from "./Error";
import { Link } from "react-router-dom";
import CartLogo from "../assets/shopping-cart.svg";
import MarketLogo from "../assets/market.svg";

const MarketList = ({ searchResults, searchTerm }) => {
  const onNewMarket = (prevQuery, newData) => {
    let updatedQuery = { ...prevQuery }; // copy previous list
    const updatedMarketList = [
      newData.onCreateMarket, // newly created market
      ...prevQuery.listMarkets.items, // add the old markets
    ];
    updatedQuery.listMarkets.items = updatedMarketList; // update markets
    return updatedQuery;
  };

  return (
    <Connect
      query={graphqlOperation(listMarkets)}
      subscription={graphqlOperation(onCreateMarket)}
      onSubscriptionMsg={onNewMarket}
    >
      {({ data, loading, errors }) => {
        if (errors.length > 0) return <Error errors={errors} />;

        if (loading || !data.listMarkets) return <Loading fullscreen={true} />;

        console.log("searchResults");
        console.log(searchResults.length);
        const markets =
          searchResults.length > 0 ? searchResults : data.listMarkets.items;

        return (
          <>
            {searchResults.length > 0 ? (
              <h2 className="text-green">
                <Icon type="success" name="check" className="icon" />
                {searchResults.length} results for "{searchTerm}"
              </h2>
            ) : (
              <h2>
                <img src={MarketLogo} alt="Store Icon" className="large-icon" />
                Markets
              </h2>
            )}
            {markets.map((market) => (
              <div className="my-2" key={market.id}>
                <Card
                  bodyStyle={{
                    padding: "0.7em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span className="flex">
                      <Link className="link" to={`/markets/${market.id}`}>
                        {market.name}
                      </Link>
                      <span style={{ color: "var(--darkAmazonOrange)" }}>
                        {/* {market.products.items.length} */}
                        {market.products === [] ? market.products.items : 0}
                      </span>
                      <img
                        src={CartLogo}
                        alt="Cart"
                        style={{ height: "20px" }}
                      />
                    </span>
                    <div style={{ color: "var(--lightSquidInk)" }}>
                      {market.owner}
                    </div>
                  </div>
                  <div>
                    {market.tags &&
                      market.tags.map((tag) => (
                        <Tag key={tag} type="danger" className="mx-1">
                          {tag}
                        </Tag>
                      ))}
                  </div>
                </Card>
              </div>
            ))}
          </>
        );
      }}
    </Connect>
  );
};

export default MarketList;
