import React from "react";
import LocalForage from "localforage";

import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";

import DashBkgd from "./Images/dash_digital-cash_logo_2018_rgb_for_screens.png";

import Spinner from "react-bootstrap/Spinner";
//import Form from "react-bootstrap/Form";
//import Alert from "react-bootstrap/Alert";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import TopNav from "./Components/TopNav/TopNav";

import TabsOnPage from "./Components/Pages/TabsOnPage";
import CreditsOnPage from "./Components/Pages/CreditsOnPage";
import LowCreditsOnPage from "./Components/Pages/LowCreditsOnPage";

import NameSearchForm from "./Components/Pages/NameSearchForm";
import HowToUseComponent from "./Components/HowToUseComponent";

import Proofs from "./Components/Pages/Proofs";

import Footer from "./Components/Footer";

import ConnectWalletModal from "./Components/TopNav/ConnectWalletModal";
import LogoutModal from "./Components/TopNav/LogoutModal";

import TopUpIdentityModal from "./Components/TopUpIdentityModal";

import CreateProofModal from "./Components/YourProofs/CreateProofModal";
import DeleteProofModal from "./Components/YourProofs/DeleteProofModal";

import "./App.css";
import YourProofsPage from "./Components/YourProofs/YourProofsPage";

const Dash = require("dash");

// const {
//   Essentials: { Buffer },
//   PlatformProtocol: { Identifier },
// } = Dash;

//const {Message} = require('dash');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,

      whichTab_POD: "Search", //Search and Your Proofs

      isLoading: false, //For identity and name And not identityInfo that is handle on component

      isLoadingSearch_POD: false,

      isLoadingWallet: true, //For wallet for topup

      isLoadingYourProofs: true,

      mode: "dark",

      presentModal: "",
      isModalShowing: false,
      whichNetwork: "testnet",

      nameToSearch_POD: "",
      nameFormat_POD: false,
      isTooLongNameError_POD: false, // <- not connected to anything

      SearchedNameDoc_POD: {
        $ownerId: "4h5j6j",
        label: "Alice",
      },

      SearchedProofs: [
        {
          $ownerId: "4h5j6j",
          $id: "7ku98rj",

          address: "yadAMKzCFruDYg7bsvLVFfjXuVsN4rPqzw",
          message: "Its a me, Mario! I mean Alice lol",
          signature:
            "H2KKtQ1vdvAMeGHATxCa8Scj+xwscwzbIfpGKE20Ff1+PQQ+3vYZCKOoynzZ+SP9Wkv7k7es0XjFsgt4eK/7d0g=",

          $updatedAt: Date.now() - 1000000,
        },
      ],

      YourProofs: [],

      selectedYourProof: "",
      selectedYourProofIndex: "",

      mnemonic: "",
      identity: "",
      identityInfo: "",
      identityRaw: "",
      uniqueName: "",

      accountBalance: "",

      walletId: "",
      mostRecentLogin: false,
      platformLogin: false, //Will this be used? -> check -> no
      LocalForageKeys: [],

      skipSynchronizationBeforeHeight: 905000,
      mostRecentBlockHeight: 905000,

      DataContractPOD: "9umPSgjEukfYiygXCMW7zfUVuHTFJSm7VAzbX6rwJgT9",
      DataContractDPNS: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",

      expandedTopNav: false,
    };
  }

  closeTopNav = () => {
    this.setState({
      expandedTopNav: false,
    });
  };

  toggleTopNav = () => {
    if (this.state.expandedTopNav) {
      this.setState({
        expandedTopNav: false,
      });
    } else {
      this.setState({
        expandedTopNav: true,
      });
    }
  };

  handleTab_POD = (eventKey) => {
    if (eventKey === "Search")
      this.setState({
        whichTab_POD: "Search",
      });
    else {
      this.setState({
        whichTab_POD: "Your Proofs",
      });
    }
  };

  // handleYourPost = (index) => {
  //   this.setState(
  //     {
  //       selectedYourPost: this.state.yourPostsToDisplay[index],
  //       selectedYourPostIndex: index,
  //     },
  //     () => this.showModal("EditPostModal")
  //   );
  // };

  handleDeleteYourProof = (index) => {
    this.setState(
      {
        selectedYourProof: this.state.YourProofs[index],

        selectedYourProofIndex: index,
      },
      () => this.showModal("DeleteProofModal")
    );
  };

  // FORM Functions
  handleOnChangeValidation_POD = (event) => {
    this.setState({
      isError: false,
    });

    if (event.target.id === "validationCustomName") {
      this.nameValidate_POD(event.target.value);
    }
  };

  nameValidate_POD = (nameInput) => {
    let regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/;
    let valid = regex.test(nameInput);

    if (valid) {
      this.setState({
        nameToSearch_POD: nameInput,
        nameFormat_POD: true,
      });
    } else {
      this.setState({
        nameToSearch_POD: nameInput,
        nameFormat_POD: false,
      });
    }
  };

  searchName_POD = () => {
    this.setState({
      isLoadingSearch_POD: true,
      SearchedNameDoc_POD: "",
      SearchedProofs: [],
    });

    const client = new Dash.Client(this.state.whichNetwork);

    const retrieveName = async () => {
      // Retrieve by full name (e.g., myname.dash)
      return client.platform.names.resolve(
        `${this.state.nameToSearch_POD}.dash`
      );
    };

    retrieveName()
      .then((d) => {
        if (d === null) {
          console.log("No DPNS Document for this Name.");
          this.setState({
            SearchedNameDoc_POD: "No NameDoc", //Handle if name fails ->
            isLoadingSearch_POD: false,
          });
        } else {
          let nameDoc = d.toJSON();
          console.log("Name retrieved:\n", nameDoc);

          this.searchForProofs(nameDoc.$ownerId);

          this.setState({
            SearchedNameDoc_POD: nameDoc,
          });
        }
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          isLoadingSearch_POD: false,
        });
      })
      .finally(() => client.disconnect());
  };
  // FORM Functions ^^^
  hideModal = () => {
    this.setState({
      isModalShowing: false,
    });
  };

  showModal = (modalName) => {
    this.setState({
      presentModal: modalName,
      isModalShowing: true,
    });
  };

  handleMode = () => {
    if (this.state.mode === "primary")
      this.setState({
        mode: "dark",
      });
    else {
      this.setState({
        mode: "primary",
      });
    }
  };

  // &&&    &&&   &&&   &&&   &&&   &&&   &&&&

  handleLogout = () => {
    this.setState({
      isLoggedIn: false,
      whichTab_POD: "Search", //Search and Your Proofs

      isLoading: false, //For identity and name And not identityInfo that is handle on component

      isLoadingSearch_POD: false,

      isLoadingWallet: true, //For wallet for topup

      isLoadingYourProofs: true,

      mode: "dark",

      presentModal: "",
      isModalShowing: false,
      whichNetwork: "testnet",

      nameToSearch_POD: "",
      nameFormat_POD: false,
      isTooLongNameError_POD: false,

      SearchedNameDoc_POD: {
        $ownerId: "4h5j6j",
        label: "Alice",
      },

      SearchedProofs: [
        {
          $ownerId: "4h5j6j",
          $id: "7ku98rj",

          address: "yadAMKzCFruDYg7bsvLVFfjXuVsN4rPqzw",
          message: "Its a me, Mario! I mean Alice lol",
          signature:
            "H2KKtQ1vdvAMeGHATxCa8Scj+xwscwzbIfpGKE20Ff1+PQQ+3vYZCKOoynzZ+SP9Wkv7k7es0XjFsgt4eK/7d0g=",

          $updatedAt: Date.now() - 1000000,
        },
      ],

      YourProofs: [],

      selectedYourProof: "",
      selectedYourProofIndex: "",

      mnemonic: "",
      identity: "",
      identityInfo: "",
      identityRaw: "",
      uniqueName: "",

      accountBalance: "",

      walletId: "",
      mostRecentLogin: false,
      platformLogin: false, //Will this be used? -> check ->
      LocalForageKeys: [],

      skipSynchronizationBeforeHeight: 905000,
      mostRecentBlockHeight: 905000,

      DataContractPOD: "9umPSgjEukfYiygXCMW7zfUVuHTFJSm7VAzbX6rwJgT9",
      DataContractDPNS: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",

      expandedTopNav: false,
    });
    // this.setState({}, () => this.componentDidMount());
  };

  //   componentDidMount() {

  // //All componentDidMount will do is call the initial queries -> okay then how will the login work ? So it really just needs platform and not wallet.

  // //THOUGHT <- wHAT IF i DO ONE PULL FOR THE INITIAL AND THEN SORT SO INSTEAD OF UP TO 10 ITS JUST 2 AND THEN i CAN DO A MOST RECENT BECAUSE PEOPLE WILL BE LOGGING IN FAIRLY QUICKLY..
  // //mAKE IT FAT. <- OKAY AND ITS HOW IT IS SET UP ANYWAY DOUBLE WIN

  //     LocalForage.config({
  //       name: "dashmoney-platform-login",
  //     });

  //     LocalForage.getItem("mostRecentWalletId")
  //       .then((val) => {
  //         if (val !== null) {
  //           //this.handleInitialQuerySeq(val.identity);
  //           this.setState({
  //             walletId: val.walletId,
  //             identity: val.identity,
  //             uniqueName: val.name,
  //           });
  //         } else {
  //           console.log("There is no mostRecentWalletId");
  //         }
  //       })
  //       .catch(function (err) {
  //         console.log(err);
  //       });

  // //***Next Bit Gets MostRecentBlockHeight */ //tHIS IS FOR THE PLATFORM LOGIN BC THE OFFLINE WALLET GRAB JUST GETS THE WALLETID.. OKAY THEN WHAT DO i NEED THE MOST RECENT FOR THEN? TO GET THE IDENTITYiNFO??
  // //iS THIS MORE LIKE dso AND NOT dgp, they are actually pretty similar
  //     const clientOpts = {
  //       network: this.state.whichNetwork,
  //     };
  //     const client = new Dash.Client(clientOpts);

  //     const getMostRecentBlockHeight = async () => {
  //       const status = await client.getDAPIClient().core.getStatus();

  //       return status;
  //     };

  //     getMostRecentBlockHeight()
  //       .then((d) => {
  //         let blockHeight = d.chain.blocksCount;
  //         console.log("Most Recent Block Height:\n", blockHeight);
  //         this.setState({
  //           mostRecentBlockHeight: blockHeight - 6,
  //         });
  //       })
  //       .catch((e) => {
  //         console.error("Something went wrong:\n", e);
  //       })
  //       .finally(() => client.disconnect());

  // //Next Part Gets keys for platform login check
  //     LocalForage.keys()
  //       .then((keys) => {
  //         this.setState({
  //           LocalForageKeys: keys,
  //         });
  //         console.log('Local Forage keys:\n', keys);
  //       })
  //       .catch(function (err) {
  //         console.log(err);
  //       });

  //   }

  handleInitialQuerySeq = (theIdentity) => {
    //this is with the mostrecent login so its a guess
    //this.getYourProofs(theIdentity);
  };

  handleWalletConnection = (theMnemonic) => {
    if (this.state.LocalForageKeys.length === 0) {
      this.setState(
        {
          isLoggedIn: true,
          isLoading: true,
          mnemonic: theMnemonic,
        },
        () => this.getIdentitywithMnem(theMnemonic)
      );
    } else {
      this.setState(
        {
          isLoggedIn: true,
          isLoading: true,
          mnemonic: theMnemonic,
        },
        () => this.checkPlatformOnlyLogin(theMnemonic)
      );
    }
  };

  checkPlatformOnlyLogin = (theMnemonic) => {
    console.log("Called Check Platform Login");

    const clientOpts = {
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: theMnemonic,
        offlineMode: true,
      },
    };

    const client = new Dash.Client(clientOpts);

    let walletIdToTry;

    const getWalletId = async () => {
      const account = await client.getWalletAccount();

      walletIdToTry = account.walletId;
      //console.log("walletIdToTry:", walletIdToTry);

      return walletIdToTry === this.state.walletId;
    };

    getWalletId()
      .then((mostRecentMatch) => {
        console.log(`Most Recent Matches -> ${mostRecentMatch}`);

        if (!mostRecentMatch) {
          let isKeyAvail = this.state.LocalForageKeys.includes(walletIdToTry);
          // console.log(`LocalForage Test -> ${isKeyAvail}`);

          if (isKeyAvail) {
            console.log("This here is a login skip!!");

            LocalForage.getItem(walletIdToTry)
              .then((val) => {
                //  console.log("Value Retrieved", val);

                if (
                  val !== null ||
                  typeof val.identity !== "string" ||
                  val.identity === "" ||
                  val.name === "" ||
                  typeof val.name !== "string"
                ) {
                  this.setState(
                    {
                      platformLogin: true,
                      identity: val.identity,
                      uniqueName: val.name,
                      walletId: walletIdToTry,
                      YourProofs: [],
                      isLoading: false,
                      isLoadingYourProofs: true,
                      //maintain Loading bc continuing to other functions
                    },
                    () => this.handleStartQuerySeq(val.identity, theMnemonic)
                  );

                  let lfObject = {
                    walletId: walletIdToTry,
                    identity: val.identity,
                    name: val.name,
                  };
                  LocalForage.setItem("mostRecentWalletId", lfObject)
                    .then((d) => {
                      //return LocalForage.getItem(walletId);
                      // console.log("Return from LF setitem:", d);
                    })
                    .catch((err) => {
                      console.error(
                        "Something went wrong setting to localForage:\n",
                        err
                      );
                    });
                } else {
                  //  console.log("platform login failed");
                  //this.getIdentitywithMnem(theMnemonic);
                  //() => this.getNamefromIdentity(val)); // send to get it
                }
              })
              .catch((err) => {
                console.error(
                  "Something went wrong getting from localForage:\n",
                  err
                );
              });
          } else {
            this.setState(
              {
                //This is for if no platform login at all. resets
                identityInfo: "",
                identityRaw: "",
                uniqueName: "",
                YourProofs: [],
                isLoading: true,
                isLoadingYourProofs: true,
              },
              () => this.getIdentitywithMnem(theMnemonic)
            );
          }
        } //Closes mostRecentMatch
        else {
          this.setState(
            {
              mostRecentLogin: true,
              platformLogin: true,
              isLoading: false,
            },
            () => this.handleMostRecentLogin(theMnemonic)
          );
        }
      })
      .catch((e) => console.error("Something went wrong:\n", e))
      .finally(() => client.disconnect());
  };

  /* ************************************************************** */

  handleMostRecentLogin = (theMnemonic) => {
    //check if loading is done and push to display state
    this.getYourProofs(this.state.identity);
    this.getIdentityInfo(this.state.identity);
    this.getWalletwithMnem(theMnemonic);
  };

  handleStartQuerySeq = (theIdentity, theMnemonic) => {
    this.getYourProofs(theIdentity);

    this.getIdentityInfo(theIdentity);

    this.getWalletwithMnem(theMnemonic);
  };

  getIdentitywithMnem = (theMnemonic) => {
    const client = new Dash.Client({
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: theMnemonic,
        unsafeOptions: {
          skipSynchronizationBeforeHeight: this.state.mostRecentBlockHeight,
        },
      },
    });

    let walletIdToTry;

    const retrieveIdentityIds = async () => {
      const account = await client.getWalletAccount();

      //console.log(account);
      // this.setState({
      //   accountAddress: account.getUnusedAddress().address, //This can be used if you havent created the DGMDocument <-
      // });

      walletIdToTry = account.walletId;
      // console.log(walletIdToTry);

      return account.identities.getIdentityIds();
    };

    retrieveIdentityIds()
      .then((d) => {
        // console.log("Mnemonic identities:\n", d);
        //This if - handles if there is an identity or not
        if (d.length === 0) {
          this.setState({
            isLoading: false,
            identity: "No Identity",
          });
        } else {
          this.setState(
            {
              walletId: walletIdToTry,
              identity: d[0],
              isLoading: false,
              //maintain Loading bc continuing to other functions
            },
            () => this.callEverythingBcHaveIdentityNow(d[0], theMnemonic)
          );
        }
      })
      .catch((e) => {
        console.error("Something went wrong getting IdentityIds:\n", e);
        this.setState({
          isLoading: false,
          identity: "No Identity",
        });
      })
      .finally(() => client.disconnect());
  };

  callEverythingBcHaveIdentityNow = (theIdentity, theMnemonic) => {
    if (!this.state.platformLogin) {
      this.getYourProofs(theIdentity);
      this.getNamefromIdentity(theIdentity);
      this.getIdentityInfo(theIdentity);
    }

    this.getWalletwithMnem(theMnemonic);
  };

  getWalletwithMnem = (theMnemonic) => {
    const client = new Dash.Client({
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: theMnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
    });

    const retrieveIdentityIds = async () => {
      const account = await client.getWalletAccount();
      //console.log(account);
      //console.log(account.getTotalBalance());
      // console.log(account.getUnusedAddress().address);
      //console.log('TX History: ', account.getTransactionHistory());

      this.setState({
        //accountWallet: client, //Can I use this for the send TX?-> NO
        accountBalance: account.getTotalBalance(),
        accountAddress: account.getUnusedAddress().address, //This can be used if you havent created the DGMDocument <-
        accountHistory: account.getTransactionHistory(),
      });

      return true;
    };

    retrieveIdentityIds()
      .then((d) => {
        console.log("Wallet Loaded:\n", d);
        this.setState({
          isLoadingWallet: false,
        });
        //This if - handles if there is an identity or not
        // if (d.length === 0) {
        //   this.setState({
        //     isLoading: false,
        //     identity: "No Identity",
        //   });
        // } else {
        //   this.setState(
        //     {
        //       identity: d[0],
        //       isLoading: false,
        //       //maintain Loading bc continuing to other functions
        //     }
        //   );
        // }
      })
      .catch((e) => {
        console.error("Something went wrong getting Wallet:\n", e);
        this.setState({
          isLoadingWallet: false,
          isLoading: false,
          identity: "Identity Error",
        });
      })
      .finally(() => client.disconnect());
  };

  getNamefromIdentity = (theIdentity) => {
    const client = new Dash.Client({
      network: this.state.whichNetwork,
    });

    const retrieveNameByRecord = async () => {
      // Retrieve by a name's identity ID
      return client.platform.names.resolveByRecord(
        "dashUniqueIdentityId",
        theIdentity // Your identity ID
      );
    };

    retrieveNameByRecord()
      .then((d) => {
        let nameRetrieved = d[0].toJSON();

        //console.log("Name retrieved:\n", nameRetrieved);

        //******************** */
        let lfObject = {
          identity: theIdentity,
          name: nameRetrieved.label,
        };

        LocalForage.setItem(this.state.walletId, lfObject)
          .then((d) => {
            //return LocalForage.getItem(walletId);
            //   console.log("Return from LF setitem:", d);
          })
          .catch((err) => {
            console.error(
              "Something went wrong setting to localForage:\n",
              err
            );
          });
        //******************** */
        lfObject = {
          walletId: this.state.walletId,
          identity: theIdentity,
          name: nameRetrieved.label,
        };

        LocalForage.setItem("mostRecentWalletId", lfObject)
          .then((d) => {
            //return LocalForage.getItem(walletId);
            //  console.log("Return from LF setitem:", d);
          })
          .catch((err) => {
            console.error(
              "Something went wrong setting to localForage:\n",
              err
            );
          });
        //******************** */
        this.setState({
          uniqueName: nameRetrieved.label,
          isLoading: false,
        });
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        // console.log("There is no dashUniqueIdentityId to retrieve");
        this.setState({
          isLoading: false,
          uniqueName: "Name Error",
        });
      })
      .finally(() => client.disconnect());
  };

  getIdentityInfo = (theIdentity) => {
    console.log("Called get Identity Info");

    const client = new Dash.Client({ network: this.state.whichNetwork });

    const retrieveIdentity = async () => {
      return client.platform.identities.get(theIdentity); // Your identity ID
    };

    retrieveIdentity()
      .then((d) => {
        // console.log("Identity retrieved:\n", d.toJSON());

        this.setState({
          identityInfo: d.toJSON(),
          identityRaw: d,
          //isLoading: false,
        });
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);

        // this.setState({
        //   isLoading: false,
        // });
      })
      .finally(() => client.disconnect());
  };

  getYourProofs = (theIdentity) => {
    //console.log("Calling getInitialOffRent");

    const clientOpts = {
      network: this.state.whichNetwork,
      apps: {
        PODContract: {
          contractId: this.state.DataContractPOD,
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const getDocuments = async () => {
      return client.platform.documents.get("PODContract.podproof", {
        where: [
          ["$ownerId", "==", theIdentity],
          ["$createdAt", "<=", Date.now()],
        ],
        orderBy: [["$createdAt", "desc"]],
      });
    };

    getDocuments()
      .then((d) => {
        if (d.length === 0) {
          console.log("There are no Your Proofs");

          this.setState({
            isLoadingYourProofs: false,
          });
        } else {
          let docArray = [];
          //console.log("GettingYour Proofs");
          for (const n of d) {
            console.log("Document:\n", n.toJSON());
            docArray = [...docArray, n.toJSON()];
          }

          this.setState({
            YourProofs: docArray,
            isLoadingYourProofs: false,
          });
        }
      })
      .catch((e) => console.error("Something went wrong:\n", e))
      .finally(() => client.disconnect());
  };

  // ####   ####   ####   ####   ####   ####   #####

  searchForProofs = (theIdentity) => {
    //console.log("Calling getSearchProofs");

    const clientOpts = {
      network: this.state.whichNetwork,
      apps: {
        PODContract: {
          contractId: this.state.DataContractPOD,
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const getDocuments = async () => {
      return client.platform.documents.get("PODContract.podproof", {
        where: [
          ["$ownerId", "==", theIdentity],
          ["$createdAt", "<=", Date.now()],
        ],
        orderBy: [["$createdAt", "desc"]],
      });
    };

    getDocuments()
      .then((d) => {
        if (d.length === 0) {
          //console.log("There are no SearchProofs");

          this.setState({
            //SearchedProofs: [],
            isLoadingSearch_POD: false,
          });
        } else {
          let docArray = [];
          //console.log("Getting Search Proofs");

          for (const n of d) {
            let returnedDoc = n.toJSON();
            //console.log("Review:\n", returnedDoc);
            // returnedDoc.toId = Identifier.from( //NOT FOR POD PROOFS
            //   returnedDoc.toId,
            //   "base64"
            // ).toJSON();
            //console.log("newReview:\n", returnedDoc);
            docArray = [...docArray, returnedDoc];
          }
          this.setState({
            SearchedProofs: docArray,
            isLoadingSearch_POD: false,
          });
        }
      })
      .catch((e) => console.error("Something went wrong:\n", e))
      .finally(() => client.disconnect());
  };

  //$$  $$   $$$  $$  $  $$  $$$  $$$  $$  $$

  createYourProof = (proofObject) => {
    console.log("Called Create Proof");

    this.setState({
      isLoadingYourProofs: true,
    });

    const clientOpts = {
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
      apps: {
        PODContract: {
          contractId: this.state.DataContractPOD,
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const submitProofDoc = async () => {
      const { platform } = client;

      let identity = "";
      if (this.state.identityRaw !== "") {
        identity = this.state.identityRaw;
      } else {
        identity = await platform.identities.get(this.state.identity);
      }

      const proofProperties = {
        address: proofObject.address,
        message: proofObject.message,
        signature: proofObject.signature,
      };
      //console.log('Proof to Create: ', proofProperties);

      // Create the note document
      const podDocument = await platform.documents.create(
        "PODContract.podproof",
        identity,
        proofProperties
      );

      //############################################################
      //This below disconnects the document sending..***

      // return podDocument;

      //This is to disconnect the Document Creation***
      //############################################################

      const documentBatch = {
        create: [podDocument], // Document(s) to create
      };

      await platform.documents.broadcast(documentBatch, identity);
      return podDocument;
    };

    submitProofDoc()
      .then((d) => {
        let returnedDoc = d.toJSON();
        console.log("Document:\n", returnedDoc);

        let proof = {
          $ownerId: returnedDoc.$ownerId,
          $id: returnedDoc.$id,
          $updatedAt: returnedDoc.$updatedAt,

          address: proofObject.address,
          message: proofObject.message,
          signature: proofObject.signature,
        };

        this.setState({
          YourProofs: [proof, ...this.state.YourProofs],
          isLoadingYourProofs: false,
        });
      })
      .catch((e) => {
        console.error("Something went wrong with proof creation:\n", e);
        this.setState({
          isLoadingYourProofs: false,
        });
      })
      .finally(() => client.disconnect());
  };

  deleteYourProof = () => {
    console.log("Called Delete Proof");

    this.setState({
      isLoadingYourProofs: true,
    });

    const clientOpts = {
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
      apps: {
        PODContract: {
          contractId: this.state.DataContractPOD,
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const deleteNoteDocument = async () => {
      const { platform } = client;

      let identity = "";
      if (this.state.identityRaw !== "") {
        identity = this.state.identityRaw;
      } else {
        identity = await platform.identities.get(this.state.identity);
      }

      const documentId = this.state.selectedYourProof.$id;

      // Retrieve the existing document

      //JUST PUT IN THE DOCUMENT THAT i ALREADY HAVE... => Done
      // Wrong ^^^ Can not use because changed to JSON

      const [document] = await client.platform.documents.get(
        "PODContract.podproof",
        { where: [["$id", "==", documentId]] }
      );
      //const document = this.state.selectedYourProof;

      // Sign and submit the document delete transition
      await platform.documents.broadcast({ delete: [document] }, identity);
      return document;
    };

    deleteNoteDocument()
      .then((d) => {
        console.log("Document deleted:\n", d.toJSON());

        let editedProofs = this.state.YourProofs;

        editedProofs.splice(this.state.selectedYourProofIndex, 1);

        this.setState({
          YourProofs: editedProofs,
          isLoadingYourProofs: false,
        });
      })
      .catch((e) => console.error("Something went wrong:\n", e))
      .finally(() => client.disconnect());
  };

  doTopUpIdentity = (numOfCredits) => {
    this.setState({
      isLoadingWallet: true,
    });
    const clientOpts = {
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const topupIdentity = async () => {
      const identityId = this.state.identity; // Your identity ID
      const topUpAmount = numOfCredits; // Number of duffs ie 1000

      await client.platform.identities.topUp(identityId, topUpAmount);
      return client.platform.identities.get(identityId);
    };

    topupIdentity()
      .then((d) => {
        console.log("Identity credit balance: ", d.balance);
        this.setState({
          identityInfo: d.toJSON(),
          identityRaw: d,
          isLoadingWallet: false,
          accountBalance: this.state.accountBalance - 1000000,
        });
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          isLoadingWallet: false,
          topUpError: true, //Add to State and handle ->
        });
      })
      .finally(() => client.disconnect());
  };

  //#######################################################################

  render() {
    this.state.mode === "primary"
      ? (document.body.style.backgroundColor = "rgb(280,280,280)")
      : (document.body.style.backgroundColor = "rgb(20,20,20)");

    this.state.mode === "primary"
      ? (document.body.style.color = "black")
      : (document.body.style.color = "white");

    return (
      <>
        <TopNav
          handleMode={this.handleMode}
          mode={this.state.mode}
          showModal={this.showModal}
          whichNetwork={this.state.whichNetwork}
          isLoggedIn={this.state.isLoggedIn}
          toggleTopNav={this.toggleTopNav}
          expandedTopNav={this.state.expandedTopNav}
        />
        <Image fluid="true" id="dash-bkgd" src={DashBkgd} alt="Dash Logo" />

        <Container className="g-0">
          <Row className="justify-content-md-center">
            <Col md={9} lg={8} xl={7} xxl={6}>
              {this.state.isLoggedIn ? (
                <>
                  <TabsOnPage
                    whichTab={this.state.whichTab_POD}
                    handleTab={this.handleTab_POD}
                  />
                  <div className="bodytextnotop">
                    {/* <CreditsOnPage identityInfo={this.state.identityInfo} /> */}

                    {this.state.whichTab_POD === "Search" ? (
                      <>
                        <LowCreditsOnPage
                          identityInfo={this.state.identityInfo}
                          uniqueName={this.state.uniqueName}
                          showModal={this.showModal}
                        />

                        {/* <div className="BottomBorder"></div> */}
                        <p></p>

                        {/* {this.state.isLoadingSearch_POD ? (
                          <>
                            <p></p>
                            <div id="spinner">
                              <Spinner animation="border" role="status">
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </Spinner>
                            </div>
                            <p></p>
                          </>
                        ) : (
                          <></>
                        )} */}

                        <h3>
                          <b>Get Proof for</b>
                        </h3>

                        <NameSearchForm
                          mode={this.state.mode}
                          nameToSearch={this.state.nameToSearch_POD}
                          nameFormat={this.state.nameFormat_POD}
                          SearchedNameDoc={this.state.SearchedNameDoc_POD}
                          //tooLongNameError={this.state.tooLongNameError}
                          searchName={this.searchName_POD}
                          handleOnChangeValidation={
                            this.handleOnChangeValidation_POD
                          }
                        />

                        {/* <div className="BottomBorder"></div> */}

                        <p></p>

                        {this.state.isLoadingSearch_POD ? (
                          <>
                            <p></p>
                            <div id="spinner">
                              <Spinner animation="border" role="status">
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </Spinner>
                            </div>
                            <p></p>
                          </>
                        ) : (
                          <>
                            <Proofs
                              mode={this.state.mode}
                              SearchedNameDoc={this.state.SearchedNameDoc_POD}
                              SearchedProofs={this.state.SearchedProofs}
                            />
                          </>
                        )}

                        <p></p>
                        <HowToUseComponent mode={this.state.mode} />
                      </>
                    ) : (
                      <>
                        {/* THIS IS WHERE THE "YOUR PROOFS" WILL GO WHEN LOGGEDIN */}
                        <p></p>
                        <CreditsOnPage
                          identityInfo={this.state.identityInfo}
                          uniqueName={this.state.uniqueName}
                          showModal={this.showModal}
                        />

                        <YourProofsPage
                          isLoadingYourProofs={this.state.isLoadingYourProofs}
                          mode={this.state.mode}
                          YourProofs={this.state.YourProofs}
                          uniqueName={this.state.uniqueName}
                          handleDeleteYourProof={this.handleDeleteYourProof}
                          showModal={this.showModal}
                        />
                      </>
                    )}
                  </div>
                </>
              ) : (
                // Landing Page ->

                <div className="bodytextnotop">
                  <div className="bodytext" style={{ textAlign: "center" }}>
                    <h4>
                      Instead of credit history, just prove you have the funds.
                    </h4>
                  </div>

                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => this.showModal("ConnectWalletModal")}
                    >
                      <b>Connect Wallet</b>
                    </Button>
                  </div>

                  <div className="BottomBorder"></div>

                  <h3>
                    <b>Get Proof for</b>
                  </h3>

                  <NameSearchForm
                    mode={this.state.mode}
                    nameToSearch={this.state.nameToSearch_POD}
                    nameFormat={this.state.nameFormat_POD}
                    SearchedNameDoc={this.state.SearchedNameDoc_POD}
                    //tooLongNameError={this.state.tooLongNameError}
                    searchName={this.searchName_POD}
                    handleOnChangeValidation={this.handleOnChangeValidation_POD}
                  />

                  {/* <div className="BottomBorder"></div> */}

                  <p></p>

                  {this.state.isLoadingSearch_POD ? (
                    <>
                      <p></p>
                      <div id="spinner">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </div>
                      <p></p>
                    </>
                  ) : (
                    <>
                      <Proofs
                        mode={this.state.mode}
                        SearchedNameDoc={this.state.SearchedNameDoc_POD}
                        SearchedProofs={this.state.SearchedProofs}
                      />
                    </>
                  )}

                  <p></p>
                  <HowToUseComponent mode={this.state.mode} />
                </div>
              )}

              <div className="bodytext">
                <Footer />
              </div>
            </Col>
          </Row>
        </Container>

        {/* #####    BELOW ARE THE MODALS    #####    */}

        {this.state.isModalShowing &&
        this.state.presentModal === "ConnectWalletModal" ? (
          <ConnectWalletModal
            isModalShowing={this.state.isModalShowing}
            handleWalletConnection={this.handleWalletConnection}
            hideModal={this.hideModal}
            mode={this.state.mode}
            closeTopNav={this.closeTopNav}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "LogoutModal" ? (
          <LogoutModal
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            handleLogout={this.handleLogout}
            closeTopNav={this.closeTopNav}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "TopUpIdentityModal" ? (
          <TopUpIdentityModal
            accountBalance={this.state.accountBalance}
            isLoadingWallet={this.state.isLoadingWallet}
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            doTopUpIdentity={this.doTopUpIdentity}
            closeTopNav={this.closeTopNav}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "CreateProofModal" ? (
          <CreateProofModal
            isModalShowing={this.state.isModalShowing}
            createYourProof={this.createYourProof}
            hideModal={this.hideModal}
            mode={this.state.mode}
            closeTopNav={this.closeTopNav}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "DeleteProofModal" ? (
          <DeleteProofModal
            selectedYourProof={this.state.selectedYourProof}
            uniqueName={this.state.uniqueName}
            deleteYourProof={this.deleteYourProof}
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            closeTopNav={this.closeTopNav}
          />
        ) : (
          <></>
        )}
      </>
    );
  }
}

export default App;
