from web3 import Web3
import json
ganache_url = "http://127.0.0.1:7545"
web3 = Web3(Web3.HTTPProvider(ganache_url))
#print(web3.isConnected())
#with open('client/src/contracts/dBank.json') as f:
#    abi = json.loads(f.read())

#address = '0xF91c14CbBFBc7088EABA2997e62875848Caa76E7'
#dbank = web3.eth.contract(address=address, abi=abi["abi"])

#with open('client/src/contracts/Token.json') as f:
#    abi_token = json.loads(f.read())

#address_token = '0x2D922F59E9aF873Fd5e8435073DacCC7E00F13A4'
#token = web3.eth.contract(address=address_token, abi=abi_token["abi"])


#is_borrow = contract.functions.isBorrowed('0x15CdC5DE172Bea29f350E4564CCcc20AAb398145').call()
#print(is_borrow)
#tx_hash = token.functions.transfer('0x15CdC5DE172Bea29f350E4564CCcc20AAb398145', 2000000000000000000).transact({'from': '0xF2b441c5c02752a4F783B89f32B8fBE277233060'})
#tx_receipt = web3.eth.waitForTransactionReceipt(tx_hash)


account_1 = "0xE91a88c7bEED9bE3f789f4Dcc8b43d6D2EB91a57"

#account_2 = "0x6dc7d0c0D8cFde919556215B3bf548024De63CD4"


private_key = "dc25399f284d2a6353e4825b00d717eeaa36752cadf277a83aaba8b1b2da32b5"

nonce = web3.eth.getTransactionCount(account_1)
#'value': web3.toWei(1, 'ether')
tx = {
    'nonce': nonce,
    'to': '',
    'value': web3.toWei(1, 'ether'),
    'gas': 20000000,
    'gasPrice': web3.toWei('30', 'gwei')}

signed_tx = web3.eth.account.signTransaction(tx, private_key)
tx_hash = web3.eth.sendRawTransaction(signed_tx.rawTransaction)
print(tx_hash)