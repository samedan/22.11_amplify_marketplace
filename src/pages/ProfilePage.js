import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
// prettier-ignore
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react'
import { API, graphqlOperation, Auth } from "aws-amplify";
import { convertCentsToDollars, formatOrderDate } from "../utils";
import { createOrder } from "./../graphql/mutations";


const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders(sortDirection: DESC, limit: 10) {
        items {
          id
          createdAt
          product {
            id
            owner
            price
            createdAt
            description
          }
          shippingAddress {
            city
            country
            address_line1
            address_state
            address_zip
          }
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

const ProfilePage = ({ user, userAttributes }) => {
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState([]);
  const [emailDialog, setEmailDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationForm, setVerificationForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [columns, setColumns] = useState([
    { prop: "name", width: "150" },
    { prop: "value", width: "330" },
    {
      prop: "tag",
      width: "150",
      render: (row) => {
        if (row.name === "Email") {
          // const emailVerified = user.result.attributes.email_verified;
          const emailVerified = userAttributes.email_verified;
          return emailVerified ? (
            <Tag type="success">Verified</Tag>
          ) : (
            <Tag type="danger">Unverified</Tag>
          );
        }
      },
    },
    {
      prop: "operations",
      render: (row) => {
        switch (row.name) {
          case "Email":
            console.log("userAttributes.email_verified");
            console.log(userAttributes.email_verified);
            return (
              <Button
                // onClick={() => handleChange({ emailDialog: true })}
                onClick={() => setEmailDialog(true)}
                type="info"
                size="small"
              >
                Edit {!userAttributes.email_verified ? " / Verify email" : ""}
              </Button>
            );
          case "Delete Profile":
            return (
              <Button type="danger" size="small" onClick={handleDeleteProfile}>
                Delete
              </Button>
            );
          default:
            return;
        }
      },
    },
  ]);

  useEffect(() => {
    if (userAttributes) {
      console.log(userAttributes);
      getUserOrders(userAttributes.sub);
      console.log(user);
      // setUserId(user.result.attributes.sub);
      setUserId(userAttributes.sub);
      setEmail(userAttributes.email);
    }

    // getUserOrders("bc26afc1-e482-4172-bb25-7d089c7e8944");
  }, []);

  const getUserOrders = async (userId) => {
    const input = { id: userId };
    const result = await API.graphql(graphqlOperation(getUser, input));
    console.log(result.data.getUser.orders.items);
    setOrders(result.data.getUser.orders.items);
  };

  const handleUpdateEmail = async () => {
    try {
      const updatedAttributes = {
        email: email,
      };
      const result = await Auth.updateUserAttributes(user, updatedAttributes);
      if (result === "SUCCESS") {
        // send verificaton code
        sendVerificationCode("email");
      }
    } catch (error) {
      console.error("Error updating email", error);
      Notification.error({
        title: "Error",
        message: `${error.message} || "Error updating email"  `,
      });
    }
  };

  const sendVerificationCode = async (attr) => {
    await Auth.verifyCurrentUserAttribute(attr);
    setVerificationForm(true);
    Message({
      type: "info",
      customClass: "message",
      message: `Verification code sent to ${email}. Please verify your email account, including the Spam folder.`,
    });
  };

  const handleVerifyEmail = async (attr) => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        attr,
        verificationCode
      );
      Notification({
        title: "Success",
        message: "Email succesfully verified",
        type: `${result.toLowerCase()}`,
      });
      setTimeout(() => window.location.reload(), 3000);
    } catch (error) {
      console.error(error);
      Notification.error({
        title: "Error",
        message: `${error.message} || "Error updating email"`,
      });
    }
  };

  const handleDeleteProfile = () => {
    MessageBox.confirm(
      "This will permanently delete your account, orders and products. Are you sure you want to continue?",
      "Attention!",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    )
      .then(async () => {
        try {
          await user.deleteUser(() => window.location.reload());
          Message({
            type: "info",
            message: "Account deleted.",
          });
        } catch (error) {
          console.error("error deleting account", error);
        }
      })
      .catch(() => {
        Message({
          type: "info",
          message: "Delete cancelled.",
        });
      });
  };

  console.log("orders on render");
  console.log(orders);
  return (
    userAttributes && (
      <>
        <Tabs activeName="1" className="profile-tabs">
          <Tabs.Pane
            name="1"
            label={
              <>
                <Icon name="document" className="icon" />
                Summary
              </>
            }
          >
            <h2 className="header">Profile Summary</h2>
            <Table
              columns={columns}
              data={[
                {
                  name: "Your Id",
                  value: userAttributes.sub,
                },
                {
                  name: "Username",
                  // value: user.result.username,
                  value: userAttributes.email,
                },
                {
                  name: "Email",
                  value: userAttributes.email,
                },
                {
                  name: "Phone Number",
                  value: userAttributes.phone_number,
                },
                {
                  name: "Delete Profile",
                  value: "Sorry to see you go",
                },
              ]}
              showHeader={false}
              rowClassName={(row) =>
                row.name === "Delete Profile" && "delete-profile"
              }
            />
          </Tabs.Pane>

          <Tabs.Pane
            name="2"
            label={
              <>
                <Icon name="message" className="icon" />
                Orders ({orders.length})
              </>
            }
          >
            <h2 className="header">Order Hystory</h2>
            {orders.map((order) => (
              <div className="mb-1" key={order.id}>
                <Card>
                  <pre>
                    <p>
                      <b>Order Id</b>: {order.id}
                    </p>
                    <p>
                      <b>Product Description</b>: {order.product.description}
                    </p>
                    <p>
                      <b>Price</b>: $
                      {convertCentsToDollars(order.product.price)}
                    </p>
                    <p>
                      <b>Purchased on</b>: {formatOrderDate( order.createdAt)}
                      
                    </p>
                    {order.shippingAddress && (
                      <>
                        <b>Shipping Address:</b>
                        <div className="ml-2">
                          <p>{order.shippingAddress.address_line1}</p>
                          <p>
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.address_zip} -{" "}
                            {order.shippingAddress.address_state}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </>
                    )}
                  </pre>
                </Card>
              </div>
            ))}
          </Tabs.Pane>
        </Tabs>
        {/* Change EMAIL Dialog */}
        <Dialog
          size="large"
          customClass="dialog"
          title="Edit email"
          visible={emailDialog}
          // setEmailDialog({ emailDialog: true })
          onCancel={() => setEmailDialog(false)}
        >
          <Dialog.Body>
            <Form labelPosition="top">
              <Form.Item label="Email (Edit or Verify email address)">
                <Input value={email} onChange={(email) => setEmail(email)} />
              </Form.Item>
              {verificationForm && (
                <Form.Item label="Enter Verification Code" labelWidth="120">
                  <Input
                    value={verificationCode}
                    onChange={(verificationCode) =>
                      setVerificationCode(verificationCode)
                    }
                  />
                </Form.Item>
              )}
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => setEmailDialog(false)}>Cancel</Button>
            {!verificationCode && (
              <Button type="primary" onClick={handleUpdateEmail}>
                Save
              </Button>
            )}
            {verificationCode && (
              <Button type="primary" onClick={() => handleVerifyEmail("email")}>
                Submit
              </Button>
            )}
          </Dialog.Footer>
        </Dialog>
      </>
    )
  );
};

export default ProfilePage;
