import React, { useEffect, useState } from "react";
import { Loading, Tabs, Icon } from "element-react";
import { API, graphqlOperation } from "aws-amplify";
import { getMarket } from "../graphql/queries";
import { Link } from "react-router-dom";
import NewProduct from "./../components/NewProduct";
import Product from "./../components/Product";

const MarketPage = ({ marketId, user }) => {
  const [market, setMarket] = useState(null);
  const [mId, setMId] = useState(marketId);
  const [userUsername, setUserUsername] = useState(user.username);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);

  useEffect(() => {
    // if (user.result !== undefined) {
    //   // console.log(user.result.username);
    //   setUserUsername(user.result.username);
    //   console.log(marketId);
    //   setMId(marketId);
    handleGetMarket();
    // }
  }, []);

  const handleGetMarket = async () => {
    const input = {
      id: userUsername,
    };
    console.log(input);
    const result = await API.graphql(graphqlOperation(getMarket, input));
    console.log(result.data.getMarket);
    setMarket(result.data.getMarket);
    checkMarketOwner();
    setIsLoading(false);
  };

  const checkMarketOwner = () => {
    console.log("userUsername");
    console.log(userUsername);
    console.log("market");
    console.log(market);

    // setIsMarketOwner(user.username === market.owner);
    // console.log({ isMarketOwner });
    return;
    //return isMarketOwner;
  };

  return isLoading ? (
    <Loading fullscreen={true} />
  ) : (
    <>
      {/* Back button */}
      <Link className="link" to="/">
        Back to Markets List
      </Link>
      {/* Market metadata */}
      <span className="items-center pt-2">
        <h2 className="mb-mr">{market.name}</h2> - {market.owner}
      </span>
      <div className="items-center pt-2">
        <span style={{ color: "var(--lightSquidInk)", paddingBottom: "1em" }}>
          <Icon name="date" className="icon" />
          {market.createdAt}
        </span>
      </div>
      {/* New Product */}
      <Tabs type="border-card" avlue={isMarketOwner ? "1" : "2"}>
        {isMarketOwner && (
          <Tabs.Pane
            label={
              <>
                <Icon name="plus" className="icon">
                  Add Product
                </Icon>
              </>
            }
            name="1"
          >
            <NewProduct />
          </Tabs.Pane>
        )}
        {/* Products List */}
        <Tabs.Pane
          label={
            <>
              <Icon name="menu" className="icon" />
              Products ({market.products.items.length})
            </>
          }
          name="2"
        >
          {
            // <div className="product list">
            //   {market.products.items.map((product) => (
            //     <Product product={product} />
            //   ))}
            // </div>
          }
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default MarketPage;
