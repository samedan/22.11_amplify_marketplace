import React from "react";
import "./App.css";
import { Auth } from "aws-amplify";
import { AmplifyTheme, Authenticator } from "aws-amplify-react";

class App extends React.Component {
  state = {
    user: null,
  };

  // useEffect(() => {

  // }, [])

  render() {
    const { user } = this.state;
    return !user ? <Authenticator /> : <div>App</div>;
  }
}

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
