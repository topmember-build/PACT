const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Pact', function(){
  let Pact, pact, owner, addr1;

  beforeEach(async ()=>{
    [owner, addr1] = await ethers.getSigners();
    Pact = await ethers.getContractFactory('Pact');
    pact = await Pact.deploy();
    await pact.waitForDeployment ? await pact.waitForDeployment() : await pact.deployed();
  });

  it('creates pact, accepts ETH deposit, prevents early release, and releases after lock', async ()=>{
    const latest = await ethers.provider.getBlock('latest');
    const now = latest.timestamp;
    const locked = now + 1000; // 1000 seconds

    const tx = await pact.createPact('0x0000000000000000000000000000000000000000', locked);
    const rc = await tx.wait();
    const pactId = 1;

    // deposit 1 ETH
    await pact.deposit(pactId, { value: ethers.parseEther('1') });

    // try release early
    try {
      await pact.release(pactId, owner.address);
      throw new Error('release did not revert');
    } catch (err) {
      expect(err.message).to.include('Pact is still locked');
    }

    // advance time
    await ethers.provider.send('evm_increaseTime', [1005]);
    await ethers.provider.send('evm_mine');

    // release
    const balanceBefore = await ethers.provider.getBalance(owner.address);
    const rtx = await pact.release(pactId, owner.address);
    await rtx.wait();

    const balanceAfter = await ethers.provider.getBalance(owner.address);
    expect(balanceAfter).to.be.gt(balanceBefore);
  });

    it('supports ERC20 deposit and release', async ()=>{
      const latest = await ethers.provider.getBlock('latest');
      const now = latest.timestamp;
      const locked = now + 1000;

      // deploy ERC20 mock
      const ERC20Mock = await ethers.getContractFactory('ERC20Mock');
      const erc = await ERC20Mock.deploy('Mock','MCK');
      await erc.waitForDeployment ? await erc.waitForDeployment() : await erc.deployed();

      // create pact with token address
      await pact.createPact(erc.target, locked);
      const pactId = 1;

      const amount = ethers.parseUnits('10', 18);

      // mint to owner and approve
      await erc.mint(owner.address, amount);
      await erc.approve(pact.target, amount);

      // deposit ERC20
      await pact.depositERC20(pactId, amount);

      // ensure cannot release early
      try {
        await pact.release(pactId, owner.address);
        throw new Error('release did not revert');
      } catch (err) {
        expect(err.message).to.include('Pact is still locked');
      }

      // advance time and release
      await ethers.provider.send('evm_increaseTime', [1005]);
      await ethers.provider.send('evm_mine');

      await pact.release(pactId, owner.address);

      // check owner token balance increased
      const bal = await erc.balanceOf(owner.address);
      expect(bal).to.equal(amount);
    });
});
