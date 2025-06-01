import assert from 'assert'
import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'ZkScoreSender'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Deploying ${contractName} on ${hre.network.name}...`)

    const endpointV2Deployment = await deployments.get('EndpointV2')

    const verifierAddress = process.env.VERIFIER_ADDRESS || '0x967e74ef3572ea6f8ae0bc3309227945613ad239'

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            endpointV2Deployment.address,
            deployer,
            verifierAddress
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed ${contractName} at address: ${address}`)
}

deploy.tags = [contractName]
export default deploy