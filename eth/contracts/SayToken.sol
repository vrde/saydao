pragma solidity ^0.6.0;

import "./ERC20.sol";
import "./ERC20Snapshot.sol";
import "./SayDAO.sol";

contract SayToken is ERC20Snapshot {

  address public daoAddress;

  constructor(address a) public ERC20("SayToken", "SAY") {
    daoAddress = a;
    //_snapshot();
  }

  // ## ERC-20 methods override
  // We need to override few methods so the token is non-transferable and
  // only the DAO can mint new tokens.

  // Disable token transfer.
  function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
    require(from == address(0), "Tokens cannot be transferred, only minted");
  }

  function balanceOf(address account)
    public
    view
    override
    returns (uint256) {
      SayDAO dao = SayDAO(daoAddress);
      uint16 member = dao.addressToMember(account);
      //require(member != 0, "Account is not a member");
      return super.balanceOf(address(member));
  }

  function balanceOfMember(address member)
    public
    view
    override
    returns (uint256) {
      return super.balanceOf(member);
  }

  function balanceOfAt(address account, uint256 snapshotId) public view override returns (uint256) {
    SayDAO dao = SayDAO(daoAddress);
    uint16 member = dao.addressToMember(account);
    return super.balanceOfAt(address(member), snapshotId);
  }

  function snapshot() public returns (uint256) {
    require(daoAddress == _msgSender(), "Only the DAO can create snapshots");
    return _snapshot();
  }


  /*
  function mint2(address account, uint256 amount) public {
    _mint(account, amount);
  }
  */


  function mint(uint16 member, uint256 amount) public {
    require(daoAddress == _msgSender(), "Only the DAO can mint new tokens");
    // ERC20 understands addresses, so we convert the uint16 representing the
    // Member Id to an address.
    _mint(address(member), amount);
  }

  // ## Custom methods

  function setDaoAddress(address a) public {
    SayDAO dao = SayDAO(daoAddress);
    require(dao.hasRole(dao.DEFAULT_ADMIN_ROLE(), _msgSender()));
    daoAddress = a;
  }

}
