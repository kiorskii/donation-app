import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const se2Token = await deployments.get("SE2Token");

    const donationContract = await deploy("DonationContract", {
        from: deployer,
        args: [se2Token.address],
        log: true,
    });

    console.log("DonationContract deployed to:", donationContract.address);
};
export default func;
func.tags = ["DonationContract"];
