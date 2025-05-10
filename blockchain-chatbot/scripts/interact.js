async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Interacting with contract using account:", deployer.address);
  
    // Get the deployed contract
    const AccessControl = await ethers.getContractFactory("AccessControl");
    const contractAddress = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"; 
    const accessControl = AccessControl.attach(contractAddress);
    
    // Call a function on the contract
    const owner = await accessControl.owner();
    console.log("Contract owner:", owner);
    
    // validating a query
    try {
      const tx = await accessControl.validateQuery("What is the weather today?");
      const receipt = await tx.wait();
      console.log("Transaction successful:", receipt.transactionHash);
      
      // Look for events
      if (receipt.events && receipt.events.length > 0) {
        console.log("Events emitted:", receipt.events.map(e => e.event));
      }
    } catch (error) {
      console.error("Error with contract:", error.message);
    }
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });