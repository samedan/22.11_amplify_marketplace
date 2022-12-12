import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
// prettier-ignore
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react'
import { API, graphqlOperation } from "aws-amplify";
import { convertCentsToDollars } from "../utils";
import { createOrder } from "./../graphql/mutations";

const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders {
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

const ProfilePage = ({ user }) => {
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      getUserOrders(user.result.username);
      console.log(user);
      setUserId(user.result.attributes.sub);
    }

    // getUserOrders("bc26afc1-e482-4172-bb25-7d089c7e8944");
  }, []);

  const getUserOrders = async (userId) => {
    const input = { id: userId };
    const result = await API.graphql(graphqlOperation(getUser, input));
    console.log(result.data.getUser.orders.items);
    setOrders(result.data.getUser.orders.items);
  };

  console.log("orders on render");
  console.log(orders);
  return (
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
        </Tabs.Pane>

        <Tabs.Pane
          name="2"
          label={
            <>
              <Icon name="message" className="icon" />
              Orders:
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
                    <b>Price</b>: ${convertCentsToDollars(order.product.price)}
                  </p>
                  <p>
                    <b>Purchased on</b>: {order.createdAt}
                  </p>
                  {order.shippingAddress && (
                    <>
                      <b>Shipping Address:</b>
                      <div className="ml-2">
                        <p>{order.shippingAddress.address_line1}</p>
                        <p>{order.shippingAddress.city}</p>
                        <p>{order.shippingAddress.address_state}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p>{order.shippingAddress.address_zip}</p>
                      </div>
                    </>
                  )}
                </pre>
              </Card>
            </div>
          ))}
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default ProfilePage;
