import hre, { ethers } from "hardhat";

async function main() {
  console.log(`Starting deployment on network: ${hre.network.name}...`);

  let semaphoreAddress: string;

  if (hre.network.name === "sepolia" || hre.network.name === "arbitrumSepolia") {
    // Use official Semaphore v4 deployment address
    semaphoreAddress = "0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D";
    console.log(`Using official Semaphore V4 address: ${semaphoreAddress}`);
  } else {
    // 1. Deploy SemaphoreVerifier
    console.log("Deploying SemaphoreVerifier...");
    const SemaphoreVerifier = await ethers.getContractFactory("SemaphoreVerifier");
    const verifier = await SemaphoreVerifier.deploy();
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();
    console.log(`SemaphoreVerifier deployed to: ${verifierAddress}`);

    // 2. Deploy PoseidonT3 library
    console.log("Deploying PoseidonT3...");
    const PoseidonT3 = await ethers.getContractFactory("PoseidonT3");
    const poseidonT3 = await PoseidonT3.deploy();
    await poseidonT3.waitForDeployment();
    const poseidonT3Address = await poseidonT3.getAddress();
    console.log(`PoseidonT3 deployed to: ${poseidonT3Address}`);

    // 3. Deploy Semaphore
    console.log("Deploying Semaphore...");
    const Semaphore = await ethers.getContractFactory("Semaphore", {
      libraries: {
        PoseidonT3: poseidonT3Address,
      },
    });
    const semaphore = await Semaphore.deploy(verifierAddress);
    await semaphore.waitForDeployment();
    semaphoreAddress = await semaphore.getAddress();
    console.log(`Semaphore deployed to: ${semaphoreAddress}`);
  }

  // 3. Deploy AegisDAO
  console.log("Deploying AegisDAO...");
  const AegisDAO = await ethers.getContractFactory("AegisDAO");
  const aegisDao = await AegisDAO.deploy(semaphoreAddress);
  await aegisDao.waitForDeployment();
  const aegisDaoAddress = await aegisDao.getAddress();
  console.log(`AegisDAO deployed to: ${aegisDaoAddress}`);

  // Get the group ID created by AegisDAO
  const groupId = await aegisDao.groupId();
  console.log(`AegisDAO Semaphore Group ID: ${groupId}`);

  // Create an initial proposal
  console.log("Creating initial proposal...");
  const tx = await aegisDao.createProposal("Should Aegis-DAO fund the privacy-preserving hackathon bounty?");
  await tx.wait();
  console.log("Initial proposal created!");

  // 4. Deploy MockERC20
  console.log("Deploying MockERC20...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockErc20 = await MockERC20.deploy("Aegis Shielded USD", "aeUSD");
  await mockErc20.waitForDeployment();
  const mockErc20Address = await mockErc20.getAddress();
  console.log(`MockERC20 deployed to: ${mockErc20Address}`);

  // 5. Deploy MockEntrypoint
  console.log("Deploying MockEntrypoint...");
  const MockEntrypoint = await ethers.getContractFactory("MockEntrypoint");
  const mockEntrypoint = await MockEntrypoint.deploy();
  await mockEntrypoint.waitForDeployment();
  const mockEntrypointAddress = await mockEntrypoint.getAddress();
  console.log(`MockEntrypoint deployed to: ${mockEntrypointAddress}`);

  console.log("Deployment complete!");
  console.log("----------------------------------");
  console.log(`SEMAPHORE_ADDRESS="${semaphoreAddress}"`);
  console.log(`AEGIS_DAO_ADDRESS="${aegisDaoAddress}"`);
  console.log(`MOCK_ERC20_ADDRESS="${mockErc20Address}"`);
  console.log(`MOCK_ENTRYPOINT_ADDRESS="${mockEntrypointAddress}"`);
  console.log("----------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
