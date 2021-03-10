pragma solidity >=0.5.0 <0.8.0;

import "./Token.sol";

contract dBank {

  Token private token;
  address private owner;
  uint256 private freeeth; 

  // in seconds (30 days)
  uint256 public min_deposit_time = 2592000;
  // in seconds (30 days)
  uint256 public max_borrow_time = 2592000;
  mapping(address => uint) public depositStart;
  mapping(address => uint) public borrowStart;
  mapping(address => uint) public etherBalanceOf;
  mapping(address => uint) public collateralEther;

  mapping(address => bool) public isDeposited;
  mapping(address => bool) public isBorrowed;

  event Deposit(address indexed user, uint etherAmount, uint timeStart);
  event Withdraw(address indexed user, uint etherAmount, uint depositTime, uint interest);
  event Borrow(address indexed user, uint collateralEtherAmount, uint borrowedTokenAmount);
  event PayOff(address indexed user, uint fee);

  constructor(Token _token) public {
    token = _token;
    owner = msg.sender;
  }

  // withdraw free eth from dbank (only onwer can call)
  function refund_eth(uint256 _amount) public {
    require(msg.sender==owner, 'Only owner can call refund function');
    require(freeeth >= _amount, 'Not enough free eth');
    msg.sender.transfer(_amount);
    freeeth -= _amount;
  }

  // function for owner (get free eth )
  function get_free_eth() public view returns (uint256) {
    require(msg.sender==owner, 'Only owner can call this function');
    return freeeth;
  }

  // function for information purposes (only dbank can call)
  function get_benefits(address _beneficiar) public view returns (uint256) {
    require(isDeposited[_beneficiar]==true, 'Error, no previous deposit');
    uint depositTime = block.timestamp - depositStart[_beneficiar];
    uint interestPerSecond = 31536000 * (etherBalanceOf[_beneficiar] / 1e16);
    uint interest = interestPerSecond * depositTime;
    return interest;
  }

  // DEPOSIT PART
  function deposit() payable public {
    require(isDeposited[msg.sender] == false, 'Deposit have already started');
    require(msg.value>=1e16, 'Error, deposit must be >= 0.01 ETH');

    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
    depositStart[msg.sender] = block.timestamp;

    isDeposited[msg.sender] = true; //deposit status --> true
    emit Deposit(msg.sender, msg.value, block.timestamp);
  }

  function withdraw() public {
    require(isDeposited[msg.sender]==true, 'Error, no previous deposit');
    // check for min deposit time (30 days in this case)
    require(block.timestamp - depositStart[msg.sender] >= min_deposit_time, 'Minimum deposit time - 30 days');
    uint userBalance = etherBalanceOf[msg.sender]; //for event
    uint depositTime = block.timestamp - depositStart[msg.sender];
    uint interestPerSecond = 31536000 * (etherBalanceOf[msg.sender] / 1e16);
    uint interest = interestPerSecond * depositTime;
    msg.sender.transfer(etherBalanceOf[msg.sender]); //eth back to user
    token.mint(msg.sender, interest); //interest to user
    depositStart[msg.sender] = 0;
    etherBalanceOf[msg.sender] = 0;
    isDeposited[msg.sender] = false;
    emit Withdraw(msg.sender, userBalance, depositTime, interest);
  }

  // BORROW PART
  // max borrow time - 1 month
  function close_borrow_for_cheating(address _cheater) public returns (bool){
    require(msg.sender==owner || msg.sender == address(this), "Only owner and dbank can call this function");
    require(isBorrowed[_cheater] == true, 'Error, loan not active');
    isBorrowed[_cheater] = false;
    token.burn(_cheater,collateralEther[_cheater]/2);
    freeeth += collateralEther[_cheater];
    collateralEther[_cheater] = 0;
    borrowStart[msg.sender] = 0;
    return true;
  }

  function borrow() payable public {
    require(msg.value>=1e16, 'Error, collateral must be >= 0.01 ETH');
    require(isBorrowed[msg.sender] == false, 'Error, loan already taken');

    collateralEther[msg.sender] = collateralEther[msg.sender] + msg.value;
    uint tokensToMint = collateralEther[msg.sender] / 2;
    token.approve(msg.sender, address(this), collateralEther[msg.sender]/2);
    token.mint(msg.sender, tokensToMint);
    isBorrowed[msg.sender] = true;
    borrowStart[msg.sender] = block.timestamp;

    emit Borrow(msg.sender, collateralEther[msg.sender], tokensToMint);
  }

  // check if payoff time <= 30 days
  function payOff() public {
    require(isBorrowed[msg.sender] == true, 'Error, loan not active');
    require(token.transferFrom(msg.sender, address(this), collateralEther[msg.sender]/2), "You have not enough DBK token to payoff");
    uint delta = block.timestamp - borrowStart[msg.sender];

    // payoff in time
    if (delta <= max_borrow_time) {
        // Bank take 10% of eth 
      uint fee = collateralEther[msg.sender]/10;
      msg.sender.transfer(collateralEther[msg.sender]-fee);
      // increase free eth
      freeeth += fee;
      collateralEther[msg.sender] = 0;
      isBorrowed[msg.sender] = false;
      borrowStart[msg.sender] = 0;
      emit PayOff(msg.sender, fee);
    } else {
      // cheat in payoff time, bank will take more % in eth and close deal
      // 10% for month, percents for 1 second
      uint percents = (delta*3858024691358025)/1e21;
      uint percent_for_multiply = (percents+10)/100;
      // late payoff but met the deadline (10 months in this case)
      if (percent_for_multiply < 1) {
        // 10 + percents = basis plus overpay for late payoff
        uint fee = collateralEther[msg.sender]*percent_for_multiply;
        msg.sender.transfer(collateralEther[msg.sender]-fee);
        // increase free eth
        freeeth += fee;
        collateralEther[msg.sender] = 0;
        isBorrowed[msg.sender] = false;
        borrowStart[msg.sender] = 0;
        emit PayOff(msg.sender, fee);
      } else {
        close_borrow_for_cheating(msg.sender);
      }
    }
  }
}