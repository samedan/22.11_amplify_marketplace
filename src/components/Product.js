import React, { useState } from "react";
import { S3Image } from "aws-amplify-react";
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from "element-react";
import { convertCentsToDollars } from "../utils";
import { UserContext } from "./../App";
import PayButton from "./PayButton";
import EmailedIcon from "../assets/emailed.svg";
import ShippedIcon from "../assets/shipped.svg";
import { convertDollarsToCents } from "./../utils/index";
import { updateProduct } from "./../graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

const Product = ({ product }) => {
  const [updateProductDialog, setUpdateProductDialog] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [shipped, setShipped] = useState(false);

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
      });
    } catch (error) {
      console.log("error updating product", error);
    }
  };

  return (
    <UserContext.Consumer>
      {({ user }) => {
        const isProductOwner = user && user.attributes.sub === product.owner;
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
                  {!isProductOwner && <PayButton />}
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
                  <Button type="danger" icon="delete" />
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
