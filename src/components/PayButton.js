import React from "react";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";
import { API, graphqlOperation } from "aws-amplify";
import { getUser } from "../graphql/queries";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey: "pk_test_gJgNpW1KQNGR4DQGcH0v5jZO",
};

const PayButton = ({ product, user }) => {
  const getOwnerEmail = async (ownerId) => {
    try {
      const input = { id: ownerId };
      const result = await API.graphql(graphqlOperation(getUser, input));
      return result.data.getUser.email;
    } catch (error) {
      console.error("Error fetching product owner email", error);
    }
  };

  const handleCharge = async (token) => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      console.log(ownerEmail);
      const result = await API.post(
        "orderlambda", // name of the LambdaFunction
        "/charge", // path
        {
          body: {
            token,
            charge: {
              currency: stripeConfig.currency,
              amount: product.price,
              description: product.description,
            },
            email: {
              customerEmail: user.attributes.email,
              ownerEmail,
              shipped: product.shipped,
            },
          },
        }
      );
      console.log({ result });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
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
