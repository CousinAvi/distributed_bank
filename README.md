# Test project for decentralisation bank

# 1) Run test blockchain Ganache
GUI - will be running on 7545 port (localhost)
command line version will be running on 8545 port (localhost)

In this case we need GUI version, but you can use command line version, for this purpose you need just change truffle-config.js in ROOT folder.

# 2) Compile contracts

- truffle compile

# 3) Deploy contracts

- truffle deploy

Now you can interract with contracts (get DBK balance of deployer account):
- truffle console
- token = await Token.deployed()
- balance_of_token = await token.balanceOf(accounts[0])
- balance_of_token.toNumber()

# 4) Information about contracts


# TOKEN DBK


Token (ERC-20 standart) inherits Pausable and SafeMath contracts
All basic functions with additions, such as:
* Increment allowance
* Dicrement allowance

You can pause token, so nobody will not allowed to do anything with token (except of owner who can (and only owner) can unpause token)
SafeMath is for developing purpose: substract, multiply, division and addition in safe way (avoiding mistakes)

# 5) dBank

You can deposit your Eth and borrow DBK tokens

# 5.1) DEPOSIT

- Minimum time for deposit: 30 days (you can change it in dBank contract)
- Minimum amout to deposit: 0.01 eth
- You can't deposit while you have already deposited

Formula for your procents:

time = ( block.timestamp - time_when_your_deposit_start)

base_procent = 31536000 * (amount_of_deposited_ether / 1e16)
31536000 - seconds in 365 days
amount_of_deposited_ether / 1e16 - how many times is your deposit more than the base deposit

procents = time * base_procents

So after withdraw you will receive DBK tokens in amount of 'procents'

# 5.2) BORROW

- Maximum time for payoff - 10 months
- Minimum amout to borrow: 0.01 eth
- You can't borrow while you have already borrowed

# HOW DOES IT WORK:

for every 1 eth you will receive 0.5 DBK

EXAMPLE:
You borrow 2 eth --> you receive 1 DBK
Bank will take 10% from your eth borrow amount (0.2 eth in this case)
You have 1 month to payoff (it is best way for you, after payoff bank take 1 DBK back and you will receive your eth back (substract bank percents))

If you overdue your time for payoff, for every month bank will incriment his percents on 10%

On an average 0.33% for every day over payoff day

IMAGINE you took borrow on 1 January (you borrowed 2 eth --> receive 1 DBK), so you need to payoff on 1 February, but you overdue payoff day and payoff day now is 1 March, so in this case bank will take something like 10% above the base rate (10%). (0.4 eth in this case)

If you missed all deadlines (10 months after borrow start), so in case of your payoff bank will take DBK tokens back, but you will not receive your eth back.

Bank reserves the right to close the deal on its own if all deadlines are missed (your borrowed tokens will be burned).


# 6) WEB RESOURCE

- cd client 
- npm run start
After all checks, the web resource will be running on 3000 port (localhost)
To interract with web resource you need browser with plugin Metamask connected to your local blockchain (Ganache in this case)

So open your browser and go to localhost:3000
Page will automatically connect to your Metamask plugin in browser.

The same functionality but on web. 
You can borrow DBK tokens or deposit your eth.
In addition you can get information about your borrow or deposit (Button 'get info about borrow' and 'get info about borrow').

# 7) TESTS
in test folder you can see 'test.js' file with tests for this project

P.S.
app.py file in ROOT folder is for develop purpose - you can interract with contracts with the help of functions inside it.
