import React, { useState, useEffect } from "react";
import { S3Image } from "aws-amplify-react";
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from "element-react";
import { convertCentsToDollars } from "../utils";
import { UserContext } from "./../App";
import { Link } from "react-router-dom";
import PayButton from "./PayButton";
import EmailedIcon from "../assets/emailed.svg";
import ShippedIcon from "../assets/shipped.svg";
import { convertDollarsToCents } from "./../utils/index";
import { updateProduct, deleteProduct } from "./../graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

const Product = ({ product }) => {
  const [updateProductDialog, setUpdateProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [shipped, setShipped] = useState(false);

  useEffect(() => {
    console.log("deleteProductDialog");
    console.log(deleteProductDialog);
  }, [deleteProductDialog]);

  const handleUpdateProduct = async (productId) => {
    try {
      setUpdateProductDialog(false);
      const input = {
        id: productId,
        price: convertDollarsToCents(price),
        description: description,
        shipped: shipped,
      };

      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      );
      console.log(result);
      Notification({
        title: "Success",
        message: "Product succesfully updated",
        type: "success",
        duration: 4000,
      });
      // Reload
      // setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.log("error updating product", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    console.log(productId);
    try {
      const input = {
        id: productId,
      };
      const result = await API.graphql(
        graphqlOperation(deleteProduct, { input })
      );
      console.log(result);
      setDeleteProductDialog(false);
      Notification({
        title: "Success",
        message: "Product succesfully deleted",
        type: "success",
        duration: 4000,
      });
      // Reload
      // setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error(`Failed to dleete product with id: ${productId}`, error);
    }
  };

  return (
    <UserContext.Consumer>
      {({ user, userAttributes }) => {
        const isProductOwner =
          userAttributes && userAttributes.sub === product.owner;
        const isEmailVerified = userAttributes && userAttributes.email_verified;
        return (
          <div className="card-container">
            <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
              <S3Image
                imgKey={product.file.key}
                theme={{
                  photoImg: { maxWidth: "100%", maxHeight: "100%" },
                }}
              />
              <div className="card-body">
                <h3 className="m-0">{product.description}</h3>
                <div className="items-center">
                  <img
                    src={product.shipped ? ShippedIcon : EmailedIcon}
                    alt="icon"
                    className="icon shipping-icon"
                  />
                  {product.shipped ? "Shipped" : "Emailed"}
                </div>
                <div className="text-right">
                  <span className="mx-1">
                    ${convertCentsToDollars(product.price)}
                  </span>
                  <br />
                  {isEmailVerified ? (
                    !isProductOwner && (
                      // PayButton
                      <PayButton
                        product={product}
                        userAttributes={userAttributes}
                      />
                    )
                  ) : (
                    <Link
                      to="/profile"
                      className="link"
                      style={{ textDecoration: "underline" }}
                    >
                      Verify email <br />
                      to buy this product
                    </Link>
                  )}
                </div>
              </div>
            </Card>
            {/* Update / delete Product buttons */}
            <div className="text-center">
              {isProductOwner && (
                <>
                  <Button
                    type="warning"
                    icon="edit"
                    className="m-1"
                    onClick={() => {
                      setUpdateProductDialog(true);
                      setDescription(product.description);
                      setPrice(convertCentsToDollars(product.price));
                      setShipped(product.shipped);
                    }}
                  />
                  {/* Delete Button */}
                  <Popover
                    placement="top"
                    width="160"
                    trigger="click"
                    visible={deleteProductDialog}
                    content={
                      <>
                        <p>Do you want to delete this product?</p>
                        <div className="text-right">
                          <Button
                            size="mini"
                            type="text"
                            className="m-1"
                            onClick={() => setDeleteProductDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            size="mini"
                            className="m-1"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Confirm
                          </Button>
                        </div>
                      </>
                    }
                  >
                    <Button
                      type="danger"
                      icon="delete"
                      onClick={() => setDeleteProductDialog(true)}
                    />
                  </Popover>
                </>
              )}
            </div>
            {/* Update Product */}
            <Dialog
              title="Update product"
              size="large"
              customClass="dialog"
              visible={updateProductDialog}
              onCancel={() => setUpdateProductDialog(false)}
            >
              <Dialog.Body>
                <Form labelPosition="top">
                  <Form.Item label="Update Description">
                    <Input
                      icon="information"
                      placeholder="Product Description"
                      onChange={(description) => setDescription(description)}
                      trim={true}
                      value={description}
                    />
                  </Form.Item>
                  <Form.Item label="Update Product Price">
                    <Input
                      type="number"
                      icon="plus"
                      placeholder="Price ($USD)"
                      // onChange={(price) => this.setState({ price })}
                      onChange={(price) => setPrice(price)}
                      value={price}
                    />
                  </Form.Item>
                  <Form.Item label="is the product Shipped or Emailed to the Customer?">
                    <div className="text-center">
                      <Radio
                        value="true"
                        checked={shipped === true}
                        onChange={() => setShipped(true)}
                      >
                        Shipped
                      </Radio>
                      <Radio
                        value="false"
                        checked={shipped === false}
                        onChange={() => setShipped(false)}
                      >
                        Emailed
                      </Radio>
                    </div>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => setUpdateProductDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleUpdateProduct(product.id)}
                >
                  Update
                </Button>
              </Dialog.Footer>
            </Dialog>
          </div>
        );
      }}
    </UserContext.Consumer>
  );
};

export default Product;
