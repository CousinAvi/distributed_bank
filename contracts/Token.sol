pragma solidity >=0.5.0 <0.8.0;

import "./SafeMath.sol";
import "./Pausable.sol";

contract Token is Pausable {

    using SafeMath for uint256;

    string public name = "dbank";
    string public symbol = "DBK";
    address private owner;
    address public minter;
    uint256 public totalSupply;
    mapping (address => uint256) public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;

    constructor() public Pausable() {
        owner = msg.sender;
        minter = msg.sender; //only initial
    }

    function get_balance(address _user) public view returns(uint256){
        return balanceOf[_user];        
    }
    
    function passMinterRole(address dBank) public whenNotPaused returns (bool) {
  	require(msg.sender==minter, 'Error, only owner can change pass minter role');
  	minter = dBank;

    return true;
    }
    
    function mint(address _account, uint256 _amount) whenNotPaused public {
        require(_account != address(0), "Mint to the zero address");
        require(_amount > 0, "Zero amount");
        require(msg.sender==minter, "Only minter allow to do this");
        totalSupply += _amount;
        balanceOf[_account] += _amount;
    }


    function pause_token() public whenNotPaused returns (bool result) {
        require(msg.sender == owner, "Only owner can pause token");
        _pause();
        return true;
    }
    
    function unpause_token() public whenPaused returns (bool result) {
        require(msg.sender == owner, "Only owner can unpause token");
        _unpause();
        return true;
    }
    
    function burn(address _account, uint _amount) whenNotPaused public {
        require(_account != address(0), "ERC20: burn from the zero address");
        uint256 accountBalance = balanceOf[_account];

        require(accountBalance >= _amount, "Burn amount exceeds balance");
        require(msg.sender == owner || msg.sender==minter, "Only owner can burn token");
        balanceOf[_account] = accountBalance - _amount;
        totalSupply -= _amount;

    }
    
    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool result) {
        require(_to != address(0), "Transfer to empty address not allowed");
        require(balanceOf[msg.sender] >= _value, "Not enough balance");
        require(_value > 0, "Number of tokens must be more then 0");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        return true;
    }

    function allowed(address _owner, address _spender) public whenNotPaused view returns (uint256) {
        require(_owner != address(0));
        require(_spender != address(0));
        return allowance[_owner][_spender];
    }
    
    function approve(address _owner, address _spender, uint256 amount) public whenNotPaused {
        // will be dbank after deploy
        require(msg.sender == minter);
        require(_owner != address(0), "ERC20: approve from the zero address");
        require(_spender != address(0), "ERC20: approve to the zero address");

        allowance[_owner][_spender] += amount;

    }


    function allow(address _to, uint256 _amount) public whenNotPaused returns (bool result) {
        require(_to != address(0), "Allow to empty address not allowed");
        require(_amount > 0, "Number of tokens must be more then 0");
        require(balanceOf[msg.sender] >= _amount, "Not enough tokens to allow");

        allowance[msg.sender][_to] = _amount;
        return true;
    }

    function increase_allow(address _to, uint256 _amount) public whenNotPaused returns (bool result) {
        require(_to != address(0), "Allow to empty address not allowed");
        require(_amount > 0, "Number of tokens must be more then 0");
        require(balanceOf[msg.sender] >= allowed(msg.sender, _to).add(_amount), "Not enough tokens to allow after increase");

        allowance[msg.sender][_to] += _amount;
        return true;
    }

    function decrease_allow(address _to, uint256 _amount) public whenNotPaused returns (bool result) {
        require(_to != address(0), "Allow to empty address not allowed");
        require(_amount > 0, "Number of tokens must be more then 0");
        require(allowed(msg.sender, _to).sub(_amount) > 0, "Allowance after decrease become < 0");

        allowance[msg.sender][_to] -= _amount;
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public whenNotPaused returns (bool result) {
        require(_from != address(0));
        require(_to != address(0));
        require(_amount > 0);
        require(allowance[_from][msg.sender] >= _amount, "Not enough allowance");
        require(balanceOf[_from] >= _amount, "Not enough tokens to transfer");

        allowance[_from][msg.sender] -= _amount;
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        return true;
    }

}
