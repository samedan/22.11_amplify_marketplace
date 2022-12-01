import React, { useEffect, useState, createContext } from "react";
import "./App.css";
import { Auth, Hub } from "aws-amplify";
import { AmplifyTheme, Authenticator } from "aws-amplify-react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import Navbar from "./components/Navbar";

export const UserContext = createContext();

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log(AmplifyTheme);
    getUserData();
    // Hub.listen("auth", this, "onHubCapsule")
  }, []);

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          console.log("signed in");
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

    Auth.currentAuthenticatedUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => console.log("Not signed in"));

    return unsubscribe;
  }, []);

  const handleSignout = async () => {
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

  return !user ? (
    <Authenticator />
  ) : (
    <UserContext.Provider value={{ user }}>
      <Router>
        <>
          {/* Navbar */}
          <Navbar user={user} handleSignout={handleSignout} />
          {/* Routes */}
          <div className="app-container">
            <Route path="/" exact component={HomePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route
              path={`/markets/:marketId`}
              component={({ match }) => (
                <MarketPage marketId={match.params.marketId} />
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
