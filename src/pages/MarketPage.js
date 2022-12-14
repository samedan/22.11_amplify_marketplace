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
import { createProduct, updateProduct } from "../graphql/mutations";

const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products(sortDirection: DESC, limit: 999) {
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

const MarketPage = ({ user, marketId, userAttributes }) => {
  const [market, setMarket] = useState(null);
  const [marketOwner, setMarketOwner] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // console.log(user);
    handleGetMarket();
  }, []);

  useEffect(() => {
    // Create
    const createProductListener = API.graphql(
      graphqlOperation(onCreateProduct, { owner: user.username })
    ).subscribe({
      next: (productData) => {
        const createdProduct = productData.value.data.onCreateProduct;
        const prevProducts = market.products.items.filter(
          (item) => item.id !== createdProduct.id
        );
        const updatedProducts = [createdProduct, ...prevProducts];
        const marketCopy = { ...market };
        marketCopy.products.items = updatedProducts;
        setMarket(marketCopy);
      },
    });
    return () => createProductListener.unsubscribe();
  }, [market, user.username]);

  useEffect(() => {
    // Delete
    const deleteProductListener = API.graphql(
      graphqlOperation(onDeleteProduct, { owner: user.username })
    ).subscribe({
      next: (productData) => {
        const deletedProduct = productData.value.data.onDeleteProduct;
        const updatedProducts = market.products.items.filter(
          (item) => item.id !== deletedProduct.id
        );
        const marketCopy = { ...market };
        marketCopy.products.items = updatedProducts;
        setMarket(marketCopy);
      },
    });
    return () => deleteProductListener.unsubscribe();
  }, [market, user.username]);

  useEffect(() => {
    // Update
    const updateProductListener = API.graphql(
      graphqlOperation(onUpdateProduct, { owner: user.username })
    ).subscribe({
      next: (productData) => {
        const updatedProduct = productData.value.data.onUpdateProduct;
        const updatedProductIndex = market.products.items.findIndex(
          (item) => item.id === updatedProduct.id
        );
        const updatedProducts = [
          ...market.products.items.slice(0, updatedProductIndex),
          updatedProduct,
          ...market.products.items.slice(updatedProductIndex + 1),
        ];
        const marketCopy = { ...market };
        console.log({ marketCopy });
        marketCopy.products.items = updatedProducts;

        setMarket(marketCopy);
      },
    });
    return () => updateProductListener.unsubscribe();
  }, [market, user.username]);

  useEffect(() => {
    // Create
    const createProductListener = API.graphql(
      graphqlOperation(onCreateProduct)
    ).subscribe({
      next: (productData) => {
        const createdProduct = productData.value.data.onCreateProduct;
        const prevProducts = market.products.items.filter(
          (item) => item.id !== createdProduct.id
        );
        const updatedProducts = [createdProduct, ...prevProducts];
        const marketCopy = { ...market };
        marketCopy.product.items = updatedProducts;
        setMarket(marketCopy);
      },
    });
    return createProductListener.unsubscribe();
  }, []);

  useEffect(() => {}, [
    market,
    isLoading,
    marketOwner,
    isEmailVerified,
    checkEmailVerified,
  ]);

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
    checkEmailVerified();

    setIsLoading(false);

    // console.log(checkMarketOwner());
  };

  const checkMarketOwner = () => {
    if (user && marketOwner !== "") {
      return user.username === marketOwner;
    }
    console.log("isMarketOwner out of if");
    return false;
  };

  const checkEmailVerified = () => {
    if (userAttributes) {
      console.log(userAttributes);
      setIsEmailVerified(userAttributes.email_verified);
    }
  };

  // const { market, isLoading, isMarketOwner } = this.state;
  return isLoading ? (
    <Loading fullscreen={true} />
  ) : (
    <>
      <Link className="link" to="/">
        Back to Markets List
      </Link>
      {checkMarketOwner() ? (
        <div
          style={{
            width: "100%",
            backgroundColor: "var(--red)",
            paddingLeft: "15px",
          }}
        >
          <h3 style={{ color: "var(--form-color)" }}>MARKET/PRODUCTS OWNER</h3>
        </div>
      ) : (
        <p>Not Owner</p>
      )}
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
            {isEmailVerified ? (
              <NewProduct marketId={marketId} />
            ) : (
              <Link to="/profile" className="header">
                Verify your email before adding products
              </Link>
            )}
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
