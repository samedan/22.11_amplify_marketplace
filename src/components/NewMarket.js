import React, { useState, useEffect } from "react";
// prettier-ignore
import { Form, Button, Dialog, Input, Notification } from 'element-react'
import Select from "react-select";
import { API, graphqlOperation } from "aws-amplify";
import { createMarket } from "./../graphql/mutations";
import { UserContext } from "../App";

const NewMarket = () => {
  const [addMarketDialog, setAddMarketDialog] = useState(false);
  const [name, setName] = useState("");

  const [selectedTags, setSelectedTags] = useState([]);
  const tags = [
    { value: "arts", label: "Arts" },
    { value: "webdev", label: "Webdev" },
    { value: "crafts", label: "Crafts" },
    { value: "entertainment", label: "Entertainment" },
  ];

  useEffect(() => {
    setSelectedTags([]);
    setName([]);
  }, []);

  const handleAddMarket = async (user) => {
    console.log(selectedTags);
    simplifyTagsForTheCourse(selectedTags);
    try {
      setAddMarketDialog(false);
      const input = {
        name: name,
        tags: simplifyTagsForTheCourse(selectedTags),
        owner: user.username,
      };
      // console.log(input);
      const result = await API.graphql(
        graphqlOperation(createMarket, { input })
      );
      console.log(result);
      console.info(`Created market: id ${result.data.createMarket.id}`);
      setName("");
      setSelectedTags([]);

      // console.log(selectedTags);
    } catch (error) {
      console.error("error adding new market", error);
      Notification.error({
        title: "Error",
        message: `${error.message || "Error adding market"} `,
      });
    }
  };

  // const handleFilterTags = (query) => {
  //   const options = tags
  //     .map((tag) => ({ value: tag, label: tag }))
  //     .filter((tag) => tag.label.toLowerCase().includes(query.toLowerCase()));
  //   setOptions(options);
  // };

  const simplifyTagsForTheCourse = (optionsSelectedAsObject) => {
    const retour = optionsSelectedAsObject.map((item) => item.label);
    return retour;
    // console.log(retour);
  };

  return (
    <UserContext.Consumer>
      {({ user }) => (
        <>
          <div className="market-header">
            <h1 className="market-title">
              Create your market place{" "}
              <Button
                type="text"
                icon="edit"
                className="market-title-button"
                onClick={() => setAddMarketDialog(true)}
              />
            </h1>
          </div>
          <Dialog
            title="Create New Market"
            visible={addMarketDialog}
            onCancel={() => setAddMarketDialog(false)}
            // onCancel={() => this.setState({ addMarketDialog: false })}
            size="large"
            customClass="dialog"
          >
            <Dialog.Body>
              <Form labelPosition="top">
                <Form.Item label="Add Market Name">
                  <Input
                    placeholder="Market Name"
                    trim={true}
                    onChange={(name) => setName(name)}
                    value={name}
                  />
                </Form.Item>
                <Form.Item label="Add Tags">
                  <Select
                    isMulti
                    // multiple={true}
                    filterable={true}
                    isSearchable
                    placeholder="Market tags"
                    onChange={(selectedTags) => setSelectedTags(selectedTags)}
                    // remoteMethod={handleFilterTags}
                    remote={true}
                    options={tags}
                    value={selectedTags}
                  />

                  {/* {options.map((option) => (
                      <Select.Option
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))} */}
                  {/* </Select> */}
                </Form.Item>
              </Form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => setAddMarketDialog(false)}>Cancel</Button>
              <Button
                disable={!name}
                onClick={() => handleAddMarket(user)}
                type="primary"
              >
                Add
              </Button>
            </Dialog.Footer>
          </Dialog>
        </>
      )}
    </UserContext.Consumer>
  );
};

export default NewMarket;
