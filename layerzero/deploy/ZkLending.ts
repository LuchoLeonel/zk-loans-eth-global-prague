import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const endpoint = process.env.ROOTSTOCK_ENDPOINT!;
  const delegate = deployer;

  await deploy("ZkLending", {
    from: deployer,
    args: [endpoint, delegate],
    log: true,
  });
};
export default func;
func.tags = ["ZkLending"];