import React from "react";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey: "pk_test_gJgNpW1KQNGR4DQGcH0v5jZO",
};

const PayButton = ({ product, user }) => {
  return (
    <StripeCheckout
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      billingAddress={product.shipped}
      shippingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;
