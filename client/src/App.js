import React, { Component } from "react";
import Web3 from 'web3';
import Token from './contracts/Token.json'
import dBank from './contracts/dBank.json'

import Navbar from './Navbar'
import Main from './Main'
import "./App.css";
class App extends Component {


  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    this.setState({addressshort: accounts[0].substr(0, 6)+' ... '+accounts[0].substr(accounts[0].length-4, accounts[0].length)})
    console.log(accounts)

    const networkId = await web3.eth.net.getId()
    const BankTokenData = Token.networks[networkId]
    const dBankData = dBank.networks[networkId]
    if (BankTokenData) {
      const bankToken = new web3.eth.Contract(Token.abi, BankTokenData.address)
      this.setState({bankToken})
      const dbank = new web3.eth.Contract(dBank.abi, dBankData.address)
      this.setState({dbank})
      let TokenBalance = await bankToken.methods.balanceOf(this.state.account).call()
      this.setState({TokenBalance: TokenBalance.toString()})
      this.setState({value: TokenBalance.toString()})
      this.setState({linkforether: 'https://etherscan.io/address/'+this.state.account})

      let deposit = await dbank.methods.isDeposited(this.state.account).call()
      this.setState({isDeposited: deposit.toString()})
      
      let depstart = await dbank.methods.depositStart(this.state.account).call()
      let depmin = await dbank.methods.min_deposit_time().call()
      var date1 = new Date(depstart*1000);
      var min_dep_time = new Date(depstart*1000+depmin*1000);
      let depether = await dbank.methods.etherBalanceOf(this.state.account).call()
      let depethereth = await web3.utils.fromWei(depether)

      

      if (depstart !== '0') { 
        this.setState({DepositStart: depstart.toString()})
        this.setState({DepositStartdate: date1.toUTCString()})
        this.setState({DepositEther: depethereth})
        this.setState({Depositmindate: min_dep_time.toUTCString()})
        let depbenefits = await dbank.methods.get_benefits(this.state.account).call()
        this.setState({Benefits: depbenefits/10**18})
      } else {
        this.setState({DepositStart: 'no deposit yet'})
        this.setState({DepositStartdate: 'no deposit yet'})
        this.setState({DepositEther: 'no deposit yet'})
        this.setState({Benefits: 'no deposit yet'})
        this.setState({Depositmindate: 'no deposit yet'})
      }

      let borrowstart = await dbank.methods.borrowStart(this.state.account).call()

      let maxdate = await dbank.methods.max_borrow_time().call()
      var datemax = new Date(borrowstart*1000+maxdate*1000);
      var date2 = new Date(borrowstart*1000);


      let borrow = await dbank.methods.isBorrowed(this.state.account).call()
      this.setState({isBorrowed: borrow.toString()})
      


      let borether = await dbank.methods.collateralEther(this.state.account).call()
      let borethereth = await web3.utils.fromWei(borether)

      if (borrow) { 
        this.setState({BorrowStartdate: date2.toUTCString()})
        this.setState({BorrowMaxdate: datemax.toUTCString()})
        this.setState({BorrowEther: borethereth})
        this.setState({Backlog: borethereth/2})
        this.setState({Fee: borethereth*0.1})
      } else {
        this.setState({BorrowStartdate: 'no borrow yet'})
        this.setState({BorrowMaxdate: 'no borrow yet'})
        this.setState({BorrowEther: 'no borrow yet'})
        this.setState({Backlog: 'no borrow yet'})
        this.setState({Fee: 'no borrow yet'})
      }






    } else {
      window.alert('Error in connection, contract does not exist in this network')
    }

    this.setState({loading: false})
  }



  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert("Please install Metamask")
    }

  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      bankToken: {},
      dbank: {},
      TokenBalance: '0',
      linkforether: '',
      loading: true,
      isDeposited: 'false',
      DepositStart: 0,
      DepositStartdate: '',
      DepositEther: '',
      Benefits: 0,
      addressshort: '0x0',
      Depositmindate: 0,

      BorrowStartdate: '',
      BorrowMaxdate: '',
      isBorrowed: 'false',
      BorrowEther: '',
      Backlog: 0,
      Fee: 0
    }
  }

  async deposit(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, deposit: ', e)
      }
    }
  }
  async withdraw() {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.withdraw().send({from: this.state.account})
      } catch (e) {
        console.log('Error, withdraw: ', e)
      }
    }
  }
  async borrow(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.borrow().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, borrow: ', e)
      }
    }
  }
  async close_borrow() {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.payOff().send({from: this.state.account})
      } catch (e) {
        console.log('Error, close_borrow: ', e)
      }
    }
  }
  render() {
    let content
    if(this.state.loading) {
      content = <div class="preloader">
      <div class="preloader__row">
        <div class="preloader__item"></div>
        <div class="preloader__item"></div>
      </div>
    </div>
    } else {
      content = <Main 
      TokenBalance={this.state.TokenBalance}
      bankToken={this.state.bankToken}
      token={this.state.token}
      />
    }

    return (
      
      <div>

        <Navbar account={this.state.account} linkforether={this.state.linkforether} short={this.state.addressshort}/>
        
        <div className="container-fluid mt-5 ">
        <div className="row justify-content-center mb-5">
          <main role="main" className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-8">
              <div className="content mr-auto ml-auto">
                {content}
              </div>
                    <div class="d-none d-md-block">
                      <h2>DEPOSIT ETHER</h2>
                      <div class="text-justify">
                        <h4>You can deposit your ether by this module.
                        Minimum deposit: 0.01 eth.
                        Tokens will increase for every second</h4>
                        <h4>Can not deposit twice from same account</h4>
                      </div>
                    </div>

              <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = amount * 10**18 //convert to wei
                      this.deposit(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                      <br></br>
                        <input
                          id='depositAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.depositAmount = input }}
                          className="form-control form-control-md col-12 col-sm-12 col-md-8 col-lg-6 col-xl-5"
                          placeholder='amount... (in Ether)'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary mb-2'>DEPOSIT</button>
                </form>
                <button type='submit' className='btn btn-secondary mb-2' data-toggle="modal" data-target="#myModal">GET INFO ABOUT DEPOSIT</button>
                <form onSubmit={(e) => {
                      e.preventDefault()
                      this.withdraw()
                    }}>
                      <button type='submit' className='btn btn-danger'>WITHDRAW</button>
                </form>
              </main>
          </div>

          <div class="container">
                <div class="modal fade" id="myModal">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h4 class="modal-title">Deposit info</h4>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                      </div>
                      <div class="modal-body">
                        Is Deposited: {this.state.isDeposited}
                      </div>
                      <div class="modal-body">
                        Deposit start time (timestamp): {this.state.DepositStart}
                      </div>
                      <div class="modal-body">
                        Deposit start time (date): {this.state.DepositStartdate}
                      </div>
                      <div class="modal-body">
                        Deposited Ether: {this.state.DepositEther}
                      </div>
                      <div class="modal-body">
                        Minimum withdraw date: {this.state.Depositmindate}
                      </div>
                      <div class="modal-body">
                        if withdraw now, will receive (DBK): {this.state.Benefits}
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                      </div>
                      
                    </div>
                  </div>
                </div>
                
              </div>


          <footer class="container-fluid pt-4 my-md-1 pt-md-5 border-top col-12 col-sm-12 col-md-9 col-lg-9 col-xl-8"></footer>

          <div class="container">
                <div class="modal fade" id="myModal2">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h4 class="modal-title">Borrow info</h4>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                      </div>
                      <div class="modal-body">
                        Is Borrowed: {this.state.isBorrowed}
                      </div>
                      <div class="modal-body">
                        Borrow start time (date): {this.state.BorrowStartdate}
                      </div>
                      <div class="modal-body">
                        Close borrow until (date): {this.state.BorrowMaxdate}
                      </div>
                      <div class="modal-body">
                        Borrowed ether: {this.state.BorrowEther}
                      </div>
                      <div class="modal-body">
                        Backlog (DBK): {this.state.Backlog}
                      </div>
                      <div class="modal-body">
                        fee (Ether): {this.state.Fee}
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                      </div>
                      
                    </div>
                  </div>
                </div>
                
              </div>

          

          <div className="row justify-content-center">
            <main role="main" className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-8">
            <div class="d-none d-md-block">
                      <h2>BORROW TOKENS</h2>
                      <div class="text-justify">
                        <h4>You can borrow tokens by this module.
                        Minimum deposit: 0.01 eth.
                        You will receive half of your borrow in eth</h4>
                        <h4>Example: borrow 1 Eth - receive 0.5 DBK</h4>
                        <h4>Can not borrow twice from same account</h4>
                      </div>
                    </div>
                <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.borrowAmount.value
                      amount = amount * 10**18 // to wei
                      this.borrow(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                        <input
                          id='borrowAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.borrowAmount = input }}
                          className="form-control form-control-md col-12 col-sm-12 col-md-8 col-lg-6 col-xl-5"
                          placeholder='borrow amount... (in Ether)'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary mb-2'>BORROW</button>
                </form>
                <button type='submit' className='btn btn-secondary mb-2' data-toggle="modal" data-target="#myModal2">GET INFO ABOUT BORROW</button>
                <form onSubmit={(e) => {
                      e.preventDefault()
                      this.close_borrow()
                    }}>
                      <button type='submit' className='btn btn-danger'>CLOSE BORROW</button>
                </form>
                </main>
          </div>
        </div>
      
      
      </div>
    );
  }
}
export default App;
