import hre from 'hardhat';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const ethers = hre.ethers;
  const network = hre.network.name;

  console.log('\n🚀 Deploying Pact contract...');
  console.log(`   Network: ${network}`);

  const [deployer] = await ethers.getSigners();
  console.log(`   Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`   Balance: ${ethers.formatEther(balance)} MON\n`);

  if (balance === 0n) {
    console.error('❌ Deployer wallet has 0 balance. Fund it first at https://faucet.monad.xyz');
    process.exit(1);
  }

  const PactFactory = await ethers.getContractFactory('Pact');
  console.log('   Sending deploy transaction...');
  const pact = await PactFactory.deploy();

  if (typeof (pact as any).waitForDeployment === 'function') {
    await (pact as any).waitForDeployment();
  } else if (typeof (pact as any).deployed === 'function') {
    await (pact as any).deployed();
  }

  const address: string = (pact as any).target ?? (pact as any).address;
  console.log(`\n✅ Pact deployed to: ${address}`);

  // Auto-update .env.local with the deployed address
  const envPath = resolve(process.cwd(), '.env.local');
  try {
    let env = readFileSync(envPath, 'utf-8');

    if (env.includes('NEXT_PUBLIC_PACT_ADDRESS=')) {
      // Replace existing (possibly empty) value
      env = env.replace(
        /^NEXT_PUBLIC_PACT_ADDRESS=.*$/m,
        `NEXT_PUBLIC_PACT_ADDRESS=${address}`
      );
    } else {
      env += `\nNEXT_PUBLIC_PACT_ADDRESS=${address}\n`;
    }

    writeFileSync(envPath, env, 'utf-8');
    console.log(`   ✓ Updated .env.local with NEXT_PUBLIC_PACT_ADDRESS=${address}`);
  } catch (err) {
    console.warn('   ⚠ Could not auto-update .env.local — set NEXT_PUBLIC_PACT_ADDRESS manually');
    console.warn(`     NEXT_PUBLIC_PACT_ADDRESS=${address}`);
  }

  // Print explorer link for Monad Testnet
  if (network === 'monadTestnet') {
    console.log(`\n   📋 Explorer: https://testnet.monadexplorer.com/address/${address}`);
  }

  console.log('\n🎉 Deployment complete! Restart your Next.js dev server to pick up the new address.\n');
}

main().catch((err: Error) => {
  console.error('\n❌ Deployment failed:', err.message);
  process.exitCode = 1;
});
