import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const se2TokenDeployment = await deployments.get("SE2Token");
    const se2TokenAddress = se2TokenDeployment.address;

    
    const donationContract = await deploy("DonationContract", {
        from: deployer,
        args: [se2TokenAddress, deployer], 
        log: true,
    });

    console.log("DonationContract deployed to:", donationContract.address);
};
export default func;
func.tags = ["DonationContract"];
func.dependencies = ["SE2Token"];
