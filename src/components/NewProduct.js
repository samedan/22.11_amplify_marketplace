import React, { useState } from "react";
// prettier-ignore
import { Form, Button, Input, Notification, Radio, Progress } from "element-react";
import { PhotoPicker } from "aws-amplify-react";
import { Storage, Auth, API, graphqlOperation } from "aws-amplify";
import aws_exports from "../aws-exports";
import { createProduct } from "../graphql/mutations";
import { convertDollarsToCents } from "../utils";

const NewProduct = ({ marketId }) => {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [image, setImage] = useState("");
  const [shipped, setShipped] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState(0);

  const handleAddProduct = async () => {
    try {
      setIsUploading(true);
      const visibility = "public"; // image visibility
      const { identityId } = await Auth.currentCredentials();
      const filename = `/${visibility}/${identityId}/${Date.now()}-${
        image.name
      }`;
      const uploadedFile = await Storage.put(filename, image.file, {
        contentType: image.type,
        // progress bar
        progressCallback: (progress) => {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          const percentUploadedNumber = Math.round(
            (progress.loaded / progress.total) * 100
          );
          setPercentUploaded(percentUploadedNumber);
        },
      });
      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region,
      };
      const input = {
        productMarketId: marketId,
        description: description,
        shipped: shipped,
        price: convertDollarsToCents(price),
        file,
      };
      const result = await API.graphql(
        graphqlOperation(createProduct, { input })
      );
      console.log("Created product", result);
      Notification({
        title: "Success",
        message: "Product successfully created",
        type: "success",
      });
      // console.log(description, price, image, shipped);
      setDescription("");
      setPrice("");
      setImagePreview("");
      setImage("");
      setShipped(false);
    } catch (error) {
      console.error("error adding product", error);
    }
  };

  return (
    <div className="flex-center">
      <h2 className="header">Add new product</h2>
      <div>
        <Form className="market-header">
          <Form.Item label="Add Product Description">
            <Input
              type="text"
              icon="information"
              placeholder="Description"
              onChange={(description) => setDescription(description)}
              value={description}
            />
          </Form.Item>
          <Form.Item label="Set Product Price">
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
          {imagePreview && (
            <img
              src={imagePreview}
              className="image-preview"
              alt="Product Preview"
            />
          )}
          {percentUploaded > 0 && (
            <Progress
              type="circle"
              className="progress"
              percentage={percentUploaded}
              // status={percentUploaded=100 ? "success": ""}
            />
          )}
          <PhotoPicker
            title="Product Image"
            preview="hidden"
            onLoad={(url) => setImagePreview(url)}
            onPick={(file) => setImage(file)}
            theme={{
              formContainer: {
                margin: 0,
                padding: "0.8em",
              },
              formSection: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              },
              sectionBody: {
                margin: 0,
                width: "250px",
              },
              sectionHeader: {
                padding: "0.2em",
                color: "var(--darkAmazonOrange)",
              },
              // photoPickerButton: {
              //   display: "none",
              // },
            }}
          />
          <Form.Item>
            <Button
              disabled={!image || !description || !price}
              type="primary"
              onClick={handleAddProduct}
              loading={isUploading}
            >
              {isUploading ? "Uploading..." : "Add Product"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
