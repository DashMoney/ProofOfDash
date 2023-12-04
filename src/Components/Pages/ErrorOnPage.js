{!this.props.isLoading &&
  this.props.identity === "No Identity" &&
  this.props.accountBalance !== 0 ? (
    <div id="bodytext">
      <p>
        No Identity was found for this wallet. Please visit{" "}
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://dashgetnames.com/"
        >
          <b>DashGetNames.com</b>
        </a>{" "}
        and register an Identity and Name for your wallet, and then
        connect wallet again.
      </p>
      <p>If this action doesn't work, Testnet Platform may be down.</p>
    </div>
  ) : (
    <></>
  )}

  {!this.props.isLoading &&
  // this.props.identityInfo === "" &&
  this.props.uniqueName === "Er" ? (
    <div id="bodytext">
      <p>
        There is no Name for this Identity, please go to{" "}
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://dashgetnames.com/"
        >
          <b>DashGetNames.com</b>
        </a>{" "}
        and register an Name for your Identity.
      </p>
      <p>
        Or you may have run into a platform issue, just reload page and
        try again.
      </p>
    </div>
  ) : (
    <></>
  )}

  {!this.props.isLoading &&
  this.props.identityInfo === "Load Failure" ? (
    <div id="bodytext">
      <p>
        There was an error in loading the identity, you may have run
        into a platform issue, please reload the page and try again.
      </p>
    </div>
  ) : (
    <></>
  )}
