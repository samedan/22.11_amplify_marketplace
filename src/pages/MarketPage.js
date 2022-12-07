import React, { useState, useEffect } from "react";
import { Loading, Tabs, Icon } from "element-react";
import {
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
} from "../graphql/subscriptions";
// import { getMarket } from "../graphql/queries";
import API, { graphqlOperation } from "@aws-amplify/api";
import { Link } from "react-router-dom";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";
import { updateProduct } from "../graphql/mutations";

const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products {
        items {
          id
          description
          price
          shipped
          owner
          file {
            key
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      tags
      owner
      createdAt
      updatedAt
    }
  }
`;

const MarketPage = ({ user, marketId }) => {
  const [market, setMarket] = useState(null);
  const [marketOwner, setMarketOwner] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);

  useEffect(() => {
    console.log(user);
    handleGetMarket();
  }, [user]);

  useEffect(() => {
    // console.log("Update market on useEffect");
    // console.log(market);
    // console.log(isLoading);
    // console.log("marketOwner in UseEffect");
    // console.log(marketOwner);
  }, [market, isLoading, marketOwner]);

  // useEffect(() => {
  //   console.log("checkMarketOwner()");
  //   checkMarketOwner();
  // }, [marketOwner]);

  // componentDidMount() {
  //   this.handleGetMarket();
  //   // const { user } = this.props;
  //   // console.log(user);
  //   // CREATE SUBSCRIPTION
  //   this.createProductListener = API.graphql(
  //     graphqlOperation(onCreateProduct, { owner: user.username })
  //   ).subscribe({
  //     next: (productData) => {
  //       const createdProduct = productData.value.data.onCreateProduct;
  //       // separate createdProdcut from the previous products
  //       const prevProducts = this.state.market.products.items.filter(
  //         (item) => item.id !== createdProduct.id
  //       );
  //       // new []
  //       const updatedProducts = [createdProduct, ...prevProducts];
  //       // shallow copy/clone of our market
  //       const market = { ...this.state.market };
  //       market.products.items = updatedProducts;
  //       this.setState({ market });
  //     },
  //   });
  //   // UPDATE SUBSCRIPTION
  //   this.updateProductListener = API.graphql(
  //     graphqlOperation(onUpdateProduct, { owner: user.username })
  //   ).subscribe({
  //     next: (productData) => {
  //       const updatedProduct = productData.value.data.onUpdateProduct;
  //       // put it back in its position in the original []
  //       const updatedProductIndex = this.state.market.products.items.findIndex(
  //         (item) => item.id === updatedProduct.id
  //       );
  //       const updatedProducts = [
  //         // [ , , , Index,
  //         ...this.state.market.products.items.slice(0, updatedProductIndex),
  //         updatedProduct,
  //         // till the end index -> ,,,]
  //         ...this.state.market.products.items.slice(updatedProductIndex + 1),
  //       ];
  //       console.log(updatedProducts);
  //       // shallow copy/clone of our market
  //       const market = { ...this.state.market };
  //       console.log(market.products.items);
  //       market.products.items = updatedProducts;
  //       console.log(market.products.items);
  //       this.setState({ market });
  //     },
  //   });
  //   // DELETE SUBSCRIPTION
  //   this.deleteProductListener = API.graphql(
  //     graphqlOperation(onDeleteProduct, { owner: user.username })
  //   ).subscribe({
  //     next: (productData) => {
  //       const deletedProduct = productData.value.data.onDeleteProduct;
  //       // separate createdProdcut from the previous products
  //       const updatedProducts = this.state.market.products.items.filter(
  //         (item) => item.id !== deletedProduct.id
  //       );
  //       // shallow copy/clone of our market
  //       const market = { ...this.state.market };
  //       market.products.items = updatedProducts;
  //       this.setState({ market });
  //     },
  //   });
  // }

  // componentWillUnmount() {
  //   this.createProductListener.unsubscribe();
  //   this.updateProductListener.unsubscribe();
  //   this.deleteProductListener.unsubscribe();
  // }

  const handleGetMarket = async () => {
    const input = {
      id: marketId,
    };
    const result = await API.graphql(graphqlOperation(getMarket, input));
    // console.log(result);
    // this.setState({ market: result.data.getMarket, isLoading: false }, () =>
    //   this.checkMarketOwner()
    // );
    // console.log("marketData", result.data.getMarket);
    const marketData = result.data.getMarket;
    // const marketOwner = marketData.owner;
    setMarketOwner(marketData.owner);

    setMarket(result.data.getMarket);

    setIsLoading(false);

    // console.log(checkMarketOwner());
  };

  const checkMarketOwner = () => {
    // const { user } = this.props;
    // const { market } = this.state;

    if (user && marketOwner !== "") {
      // this.setState({ isMarketOwner: user.username === market.owner });
      // console.log("market.owner in CheckMarketOwner");
      // console.log(marketOwner);

      // console.log("user.username in CheckMarketOwner");
      // console.log(user.username);
      // console.log("isMarketOwner");
      // console.log(user.username === market.owner);
      // console.log("isMarketOwner IN it");

      return user.username === marketOwner;
      // return user.username === market.owner;
      // console.log("isMarketOwner");
      // console.log(isMarketOwner);
    }
    console.log("isMarketOwner out of if");
    return false;
  };

  // const { market, isLoading, isMarketOwner } = this.state;
  return isLoading ? (
    <Loading fullscreen={true} />
  ) : (
    <>
      <Link className="link" to="/">
        Back to Markets List
      </Link>
      {checkMarketOwner() ? <p>OWNER</p> : <p>Not Owner</p>}
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
      <Tabs type="border-card" value={checkMarketOwner() ? "1" : "2"}>
        {checkMarketOwner() && (
          <Tabs.Pane
            label={
              <>
                <Icon name="plus" className="icon" />
                Add Product
              </>
            }
            name="1"
          >
            <NewProduct marketId={marketId} />
          </Tabs.Pane>
        )}
        {/* Products List */}
        {
          <Tabs.Pane
            label={
              <>
                <Icon name="menu" className="icon" />
                Products ({market.products.items.length})
              </>
            }
            name="2"
          >
            <div className="product-list">
              {market.products.items.map((product) => (
                <Product key={product.id} product={product} />
              ))}
            </div>
          </Tabs.Pane>
        }
      </Tabs>
    </>
  );
};

export default MarketPage;
