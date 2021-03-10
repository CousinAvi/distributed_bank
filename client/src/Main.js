import React, { Component } from "react"


class Main extends Component {

  render() {
    return (
      <div id="content" className='mt-3'>
        
        <div className="card mb-4 text-center">
            <div className="card-body">
                <form className="mb-3">                    
                    <h4>Your Balance: {this.props.TokenBalance/10**18} DBK</h4>
                </form>          
            </div>
        </div>
      </div>
    );
  }
}
export default Main;
