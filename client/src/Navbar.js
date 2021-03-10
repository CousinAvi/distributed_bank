import React, { Component } from 'react'

class Navbar extends Component {

  render() {
    return (
      <nav class="navbar navbar-expand-md navbar-light bg-light sticky-top border-bottom shadow-sm">
        <a class="navbar-brand" href="https://www.sberbank.com/ru" target="_blank" rel="noopener noreferrer">
        <img src="./icon_bank.png" width="70" height="50" class="d-inline-block" alt="..."/>
        dBank
        </a>
        <ul class="navbar-nav ml-auto">
				<li class="nav-item active">
					<a href={this.props.linkforether} target="_blank" rel="noopener noreferrer" class="nav-link text-center">Your address: {this.props.short}</a>
				</li>
			  </ul>
      </nav>
    );
  }
}

export default Navbar;
