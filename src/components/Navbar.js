import React, { useState, useEffect } from "react";
import { Menu as Nav, Icon, Button, Loading } from "element-react";
import { NavLink } from "react-router-dom";
import ReactLogo from "../assets/market.svg";
import { Auth } from "aws-amplify";

const Navbar = ({ user, handleSignOut }) => {
  // console.log(handleSignOut);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const userAtributesconsole = user.result.attributes.email;
    if (userAtributesconsole === undefined) {
      setIsLoading(true);
    } else {
      setUserEmail(userAtributesconsole);
      setIsLoading(false);
    }
  }, []);

  const handleSignOutHere = async (e) => {
    e.preventDefault();
    console.log("Sign out");

    try {
      await Auth.signOut();
    } catch (error) {
      console.error("error signing out user", error);
    }
  };

  if (isLoading) {
    return <Loading />;
  } else {
    return (
      <Nav mode="horizontal" theme="dark" defaultActive="1">
        <div className="nav-container">
          <Nav.Item index="1">
            <NavLink to="/" className="nav-link">
              <span className="app-title">
                <img
                  // src="https://icon.now.sh/account_balance/f90"
                  src={ReactLogo}
                  alt="Logo"
                  className="app-icon"
                />
                Amplify Agora
              </span>
            </NavLink>
          </Nav.Item>
          {/* Username */}
          <div className="nav-items">
            <Nav.Item index="2">
              <span className="app-user">
                Hello, <strong>{userEmail}</strong>
              </span>
            </Nav.Item>
            <Nav.Item index="3">
              <NavLink to="profile" className="nav-link">
                <Icon name="setting" />
                Profile
              </NavLink>
            </Nav.Item>
            <Nav.Item index="4">
              <Button type="warning" onClick={handleSignOutHere}>
                Sign Out
              </Button>
            </Nav.Item>
          </div>
        </div>
      </Nav>
    );
  }
};

export default Navbar;
