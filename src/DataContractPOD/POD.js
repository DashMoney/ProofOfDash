//THIS IS THE ProofOfDash - REGISTER DATA CONTRACT

const Dash = require("dash");

const clientOpts = {
  network: "testnet",

  wallet: {
    mnemonic: "12 words..", // <- CHECK
    unsafeOptions: {
      skipSynchronizationBeforeHeight: 905000,
    },
  },
};

const client = new Dash.Client(clientOpts);

const registerContract = async () => {
  const { platform } = client;
  const identity = await platform.identities.get(
    "identity id.." // <- CHECK
  );

  const contractDocuments = {
    podproof: {
      type: "object",
      indices: [
        {
          //This is proof provider query and proof searcher by name
          name: "ownerIdAndcreatedAt",
          properties: [{ $ownerId: "asc" }, { $createdAt: "asc" }],
          unique: false,
        },
        {
          //This is to ensure address uniqueness and no duplicates
          name: "address",
          properties: [{ address: "asc" }],
          unique: true,
        },
      ],
      properties: {
        address: {
          type: "string",
          minLength: 34,
          maxLength: 34,
          position: 0,
        },
        message: {
          type: "string",
          minLength: 1,
          maxLength: 450,
          position: 1,
        },
        signature: {
          type: "string",
          minLength: 1,
          maxLength: 600,
          position: 2,
        },
      },
      required: ["address", "message", "signature", "$createdAt", "$updatedAt"],
      additionalProperties: false,
    },
  };

  const contract = await platform.contracts.create(contractDocuments, identity);
  contract.setConfig({
    canBeDeleted: false,
    readonly: false, // Make contract read-only
    keepsHistory: true, // Enable storing of contract history
    documentsKeepHistoryContractDefault: false,
    documentsMutableContractDefault: true,
  });

  console.dir({ contract: contract.toJSON() });

  await platform.contracts.publish(contract, identity);
  return contract;
};

registerContract()
  .then((d) => console.log("Contract registered:\n", d.toJSON()))
  .catch((e) => console.error("Something went wrong:\n", e))
  .finally(() => client.disconnect());
