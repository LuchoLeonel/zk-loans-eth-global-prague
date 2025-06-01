import assert from 'assert'
import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'Composer'

const deploy: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  assert(deployer, 'Missing named deployer account')

  console.log(`Deploying ${contractName} on ${hre.network.name}...`)

  const endpointV2 = await hre.deployments.get('EndpointV2')
  const zkLending = await hre.deployments.get('ZkLending')

  const { address } = await deploy(contractName, {
    from: deployer,
    args: [
      endpointV2.address,
      zkLending.address
    ],
    log: true,
    skipIfAlreadyDeployed: false,
  })

  console.log(`Deployed ${contractName} at address: ${address}`)
}

deploy.tags = [contractName]
export default deploy