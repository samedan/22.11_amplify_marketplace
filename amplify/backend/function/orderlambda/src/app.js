/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const AWS = require("aws-sdk");

const config = {
  region: process.env.AWS_REGION,
  adminEmail: process.env.AWS_ADMIN_EMAIL,
  accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
};

// Simple Email Service
const ses = new AWS.SES(config);

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
// res.header("Authorization", `Bearer ${process.env.STRIPE_SECRET_KEY}`);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Authorization");
  next();
});

const chargeHandler = async (req, res, next) => {
  const { token } = req.body;
  const { description, currency, amount } = req.body.charge;
  // try {
  //   const charge = stripe.charge.create({
  //     source: token.id,
  //     amount: parseInt(amount, 10),
  //     currency,
  //     description,
  //   });
  //   res.json(charge);
  // } catch (error) {
  //   res.status(500).json({ error: error });
  // }

  stripe.charges.create(
    {
      source: token.id,
      amount: parseInt(amount, 10),
      currency,
      description,
    },
    function (err, charge) {
      if (err) {
        res.status(500).json({ error: err });
      }
      if (charge.status === "succeeded") {
        req.charge = charge;
        req.description = description;
        req.amount = amount;
        req.currency = currency;
        next(); // send email
      }
      // res.json(charge);
    }
  );
};

const emailHandler = async (req, res) => {
  const { charge } = req;
  ses.sendEmail(
    {
      Source: config.adminEmail,
      ReturnPath: config.adminEmail,
      Destination: {
        ToAddresses: [config.adminEmail, "dpopescu@adelanto.fr"],
      },
      Message: {
        Subject: {
          Data: "Order details - Amplify Markey",
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: "<h3>Order Processed!</h3>",
          },
        },
      },
    },
    (err, data) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      res.json({
        message: "Order processed succesfully",
        charge,
        data,
      });
    }
  );
};

/****************************
 * Example post method *
 ****************************/

app.post("/charge", chargeHandler, emailHandler);

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
