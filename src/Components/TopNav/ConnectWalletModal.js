import React from "react";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import CloseButton from 'react-bootstrap/CloseButton';

import "./ConnectWalletModal.css";

class ConnectWalletModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pastedText : '',
      searchedMnem: "",
      validated: true,
      validityCheck: false,
    };
  }


  handleCloseClick = () => {
    this.props.hideModal();
  };

  onChange = (event) => {
    //console.log(event.target.value);
    if (this.formValidate(event.target.value) === true) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({
        validityCheck: true,
      });
    } else {
      event.preventDefault();
      event.stopPropagation();
      this.setState({
        validityCheck: false,
      });
    }
  };

  handleSubmitClick = (event) => {
    event.preventDefault();
    console.log(event.nativeEvent.submitter.id); //Found it - identifies the button pressed
    
     if (this.formValidate(event.target.validationCustom01.value)) {
    //   if(event.nativeEvent.submitter.id==='New-Wallet-Connect'){
    //     this.props.handleNEWWalletConnection(event.target.validationCustom01.value);
    //     this.props.closeTopNav();
    //     this.props.hideModal();
    //     console.log('Successful New Wallet login');
    //   }else{
      this.props.closeTopNav();
      
      this.props.handleWalletConnection(event.target.validationCustom01.value);
      
      this.props.hideModal();
      //console.log('Successful Full Sync login');
      //}
      console.log('Successful login');
    } else {
      console.log(`Invalid Mnemonic: ${event.target.validationCustom01.value}`);
    }
  };

  formValidate = (mnemonic) => {
    let regex = /^([a-z]+[ ]){11}[a-z]+$/m;
    let valid = regex.test(mnemonic);

    if (valid) {
      this.setState({
        searchedMnem: mnemonic,
      });
      return true;
    } else {
      return false;
    }
  };

  // handlePaste = async () => {
      
  //     let pastedText = await navigator.clipboard.readText()

  //     console.log(pastedText);

  //   if (this.formValidate(pastedText)) {
  //     this.props.handleWalletConnection(pastedText);
  //     this.props.hideModal();
  //   } else {
  //     console.log(`Invalid Mnemonic: ${pastedText}`);
  //   }
  // }

  render() {
    let modalBkg = "";
    let closeButtonColor;
    let modalBackdrop;
    
    if(this.props.mode === "primary"){
      modalBackdrop = "modal-backdrop-nochange";
      modalBkg = "modal-backcolor-primary";
      closeButtonColor = <CloseButton onClick={this.handleCloseClick}/>
    }else{
      modalBackdrop = "modal-backdrop-dark";
      modalBkg = "modal-backcolor-dark";
      closeButtonColor = <CloseButton onClick={this.handleCloseClick} variant="white"/>
    }

    return (
      <>
        <Modal 
      show={this.props.isModalShowing} backdropClassName={modalBackdrop} 
      contentClassName={modalBkg}>
        <Modal.Header >
          <Modal.Title><b>Connect Wallet</b></Modal.Title>
          {closeButtonColor}
        </Modal.Header>
        <Modal.Body>
          <Form
            noValidate
            onSubmit={this.handleSubmitClick}
            onChange={this.onChange}
          >
            <Form.Group className="mb-3" controlId="validationCustom01">
              <Form.Label>Enter Wallet Mnemonic</Form.Label>
              <Form.Control
                type="text"
                placeholder= "Enter Mnemonic (12 word passphrase) here..."
                required
                isInvalid={!this.state.validityCheck}
                isValid={this.state.validityCheck}
              />
              

              <Form.Control.Feedback type="invalid">
                Please provide valid mnemonic.
              </Form.Control.Feedback>

              <Form.Control.Feedback type="valid">
              Mnemonic looks good, so long as everything is spelled correctly.
            </Form.Control.Feedback>

              
                <p></p>
                <ul>
                  <li>
                    The 12 word phrase provided upon creation of your
                    wallet.
                  </li>
                  <li>No spaces at the beginning or the end.</li>
                  <li>Use lowercase for all words.</li>
                  <li>Only one space between words.</li>
                </ul>

            </Form.Group>
            
             {/* {this.props.LocalForageKeys.length ===0 ?
            <>
            <div className="positionButtons">
            <Button id="New-Wallet-Connect" variant="primary" type="submit">
              <b>New Wallet</b>
              <Badge bg="light" text="dark" pill>
                  Connect
                </Badge>
            </Button>
            <Button id="Full-Sync-Connect" variant="primary" type="submit">
              <b>Full Sync</b>
              
            </Button>
            </div>
            <Form.Text className="text-muted">
                <p></p>
                <p><b>New Wallet</b> means the first transaction to this wallet was less than 3 days ago.
                  <b> New Wallet</b> login only takes several seconds. <b>Full Sync</b> may take a minute...
                </p>
                </Form.Text>
            </>
            : */}
            <Button variant="primary" type="submit">
              <b>Connect Wallet</b>
            </Button>
            {/* }  */}
           
              
            
          </Form>
          <p></p>

        </Modal.Body>

        <Modal.Footer>
        <p></p>

<p>
  If you do not have a wallet, go to{" "}<a rel="noopener noreferrer" target="_blank" href="https://dashgetnames.com/">
  <Badge bg="primary" text="light" pill>
    DashGetNames.com
  </Badge>
 </a>
  {" "} and get your wallet and name!
</p>
        </Modal.Footer>
      </Modal>
      </>
    );
  }
}

export default ConnectWalletModal;
