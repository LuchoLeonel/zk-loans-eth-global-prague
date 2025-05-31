import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const endpoint = process.env.SEPOLIA_ENDPOINT!;
  const delegate = deployer;

  await deploy("ZkScoreSender", {
    from: deployer,
    args: [endpoint, delegate],
    log: true,
  });
};
export default func;
func.tags = ["ZkScoreSender"];