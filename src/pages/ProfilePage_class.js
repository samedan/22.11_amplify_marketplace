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

class ProfilePage extends React.Component {
  state = {
    orders: [],
  };

  componentDidMount() {
    // if (this.props.user !== undefined) {
    //   console.log("this.props.user");
    //   console.log(this.props.user.result.attributes.sub);
    //   const cur = this.props.user.result.attributes.sub;
    //   // if (cur !== undefined) {
    //   //   this.getUserOrders(this.props.user.result.attributes.sub);
    //   // }
    //   this.getUserOrders("bc26afc1-e482-4172-bb25-7d089c7e8944");
    // }
    this.getUserOrders("bc26afc1-e482-4172-bb25-7d089c7e8944");
  }

  getUserOrders = async (userId) => {
    const input = { id: userId };
    const result = await API.graphql(graphqlOperation(getUser, input));
    console.log(result.data.getUser.orders.items);
    this.setState({ orders: result.data.getUser.orders.items });
  };

  render() {
    console.log("this.state");
    console.log(this.state);
    const { orders } = this.state;
    console.log("orders on render");
    console.log(orders);
    return (
      // <>
      // <Tabs activeName="1" className="profile-tabs">
      //   <Tabs.Pane label={<><Icon name="document" className="icon"/>Summary</>}>

      //   </Tabs.Pane>

      // </Tabs>
      // </>

      orders.map((order) => <p>{order.id}</p>)
    );
  }
}

export default ProfilePage;
