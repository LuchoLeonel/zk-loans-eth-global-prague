import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'ZkLending'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Deploying ${contractName} on ${hre.network.name}...`)

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    const minScore = 500 // puedes cambiarlo si querés

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            endpointV2Deployment.address, // LayerZero's EndpointV2 address
            deployer,                     // owner
            minScore                      // minimum score
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed ${contractName} at address: ${address}`)
}

deploy.tags = [contractName]
export default deploy
