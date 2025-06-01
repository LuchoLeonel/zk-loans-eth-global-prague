
import assert from 'assert'
import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'ZkLending'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments, ethers } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Deploying ${contractName} on ${hre.network.name}...`)

    const endpointV2Deployment = await deployments.get('EndpointV2')
    const ComposerDeployment = await deployments.get('Composer')

    const minScore = 500

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            endpointV2Deployment.address,
            deployer,
            minScore
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed ${contractName} at address: ${address}`)

    const zkLending = await ethers.getContractAt(contractName, address)
    const tx = await zkLending.setComposer(ComposerDeployment.address)
    await tx.wait()

    console.log(`Composer set to: ${ComposerDeployment.address}`)
}

deploy.tags = [contractName]
export default deploy