import React, { useEffect, useState, createContext } from "react";
import "./App.css";
import { Auth, Hub, API, graphqlOperation } from "aws-amplify";
import { getUser } from "./graphql/queries";
import { registerUser } from "./graphql/mutations";
import { AmplifyTheme, Authenticator } from "aws-amplify-react";
import { Router, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import Navbar from "./components/Navbar";
// import createBrowserHistory from "history/createBrowserHistory";
import { createBrowserHistory } from "history";
// import history from "history";
// require("history").createBrowserHistory

export const history = createBrowserHistory();

export const UserContext = createContext();

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // console.log(AmplifyTheme);
    getUserData();
    // Hub.listen("auth", this, "onHubCapsule")
  }, []);

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          console.log("signed in");
          // register new user data after the first Login (email verified)
          registerNewUser(data);
          getUserData();
          break;
        case "signUp":
          console.log("signed Up");
          break;
        case "signOut":
          console.log(" signed out");
          setUser(null);
          break;
        default:
          return;
      }
    });

    // Auth.currentAuthenticatedUser()
    //   .then((currentUser) => setUser(currentUser))
    //   .catch(() => console.log("Not signed in"));

    return unsubscribe;
  }, []);

  const handleSignout = async () => {
    console.log("Signing out");
    try {
      await Auth.signOut();
    } catch (error) {
      console.error("error signing out user", error);
    }
  };

  const getUserData = async () => {
    const result = await Auth.currentAuthenticatedUser();
    result ? setUser({ result }) : setUser(null);
  };

  // const onHubCapsule = (capsule) => {
  //   switch (capsule.payload.event) {
  //     case "signIn":
  //       console.log("signed in");
  //       getUserData();
  //       break;
  //     case "signUp":
  //       console.log("signed Up");
  //       break;
  //     case "signOut":
  //       console.log(" signed out");
  //       setUser(null);
  //       break;
  //     default:
  //       return;
  //   }
  // };

  const registerNewUser = async (signInData) => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub,
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));
    console.log(data);
    // if we cannot get a user (the user is a new one)
    // REGISTER a NEW User
    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true,
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, { input: registerUserInput })
        );
        console.log("newUser");
        console.log(newUser);
      } catch (error) {
        console.error("Error registering new user", error);
      }
    }
  };

  return !user ? (
    <Authenticator />
  ) : (
    <UserContext.Provider value={{ user }}>
      <Router history={history}>
        <>
          {/* Navbar */}
          <Navbar user={user} handleSignout={handleSignout} />
          {/* Routes */}
          <div className="app-container">
            <Route path="/" exact component={HomePage} />
            <Route
              path="/profile"
              component={() => <ProfilePage user={user} />}
            />
            <Route
              path={`/markets/:marketId`}
              component={({ match }) => (
                <MarketPage marketId={match.params.marketId} user={user} />
              )}
            />
          </div>
        </>
      </Router>
    </UserContext.Provider>
  );
};

const theme = {
  ...AmplifyTheme,
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: "#ffc0cb",
  },
  button: {
    ...AmplifyTheme.button,
    backgroundColor: "var(--amazonOrange)",
  },
  sectonBody: {
    ...AmplifyTheme.sectionBody,
    padding: "5Px",
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: "var(--squidInk)",
  },
};

// export default withAuthenticator(
//   App,
//   true, // {includeGreetings: true}
//   [],
//   null,
//   theme
// );
export default App;
