import React from 'react';
import logo from './logo2.png';
import deleteIcon from './stop.png';
import off from './off.png';
import add from './add.png';
import './App.css';
import Firebase from './firebase';
import * as firebase from 'firebase';
var db_ref = firebase.database().ref('/');

class App extends React.Component{

  constructor(props) {
    super(props);
    this.state = { email: '', password: '', errorText: '', user: '', loading: true, newTextModal: false, loop : [] };
  }

  componentDidMount(){
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({loading : false});
      var user = firebase.auth().currentUser;
      if (user) {
        this.setState({user:user, loading : true});
        var commentsRef = firebase.database().ref('users/' + user.uid);
        commentsRef.on('child_added', (data) => {
          let val = {
            type : data.val().type,
            title : data.val().title,
            body : data.val().body,
            key : data.key
          }
          this.dataAddListner(val);
        });

        commentsRef.on('child_removed', (data) => {
          let val = {
            type : data.val().type,
            title : data.val().title,
            body : data.val().body,
            key : data.key
          }
          this.dataRemoveListner(val);
        });
      }else{
        this.setState({user:user, loading : true, loop: []});
      }
    });
    document.getElementById('App').addEventListener('paste', this.handlePaste);
  };
  
  

  render() {
    const { loop, email, password, errorText, user, loading, newTextModal } = this.state;
    return (
      <div className="App" id="App">
      <meta name="viewport" content="width=device-width, user-scalable=no" />
        <header className="App-header">

          {user && (
            <img src={logo} className="App-logo" alt="logo" />
          )}
          
          {/*<p> Edit <code>src/App.js</code> and save to reload. </p>
            <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer" >
              Learn React
            </a>*/}

          {newTextModal && (
            <div class="textin-modal">
              <div class="login-input">
                <textarea type="text" placeholder="Paste Here" class="input" name="newtext" onChange={this.handleChange}/>
              </div>
              
              <button class="addbtn" onClick={()=> this.setState({newTextModal: false}) }>Done</button>
            </div>
          )}

          {!user ? (
            <div class="login-modal">
              <div class="login-input">
                <input type="text" placeholder="Email" class="input" name="email" onChange={this.handleChange} value={email}/>
                <input type="password" placeholder="Password" class="input" name="password" onChange={this.handleChange} value={password}/>
              </div>
              {errorText ? (
                <p class="errorText">
                  {errorText}
                </p>
              ):(<p/>)}
              
              <button class="btn" onClick={this.submit}>Start Copying</button>
              
            </div>
          ):(
            <div>
              <div class="user-container">
                <div class="User-toast">
                  <div class="user-toads-body"> {user.email} </div>
                  
                  <div class="logout-action" onClick={() => Firebase.logout()}>
                    <img src={off} className="deleteIcon" alt="logo" />
                  </div>
                </div>

                <div class="User-toast addTextToast" onClick={() => this.setState({ newTextModal: true })}>
                  <div class="user-toads-body"> Add </div>
                  <div class="logout-action">
                    <img src={add} className="deleteIcon" alt="logo" />
                  </div>
                </div>

              </div>

              <div class="App-toast-container">
                {loop.map((res,key) =>(
                  <div class="App-toast" id={key} key={key}>
                    <div class="toast-body" id={key} onClick={this.handleClick}>
                      <div class="Toast-input">
                        <textarea type="text" id={`toast${key}`} value={res.body} readonly/>
                      </div>              
                      {res.body}
                    </div>
                    
                    <div class="toast-action" onClick={() => this.delete(res.key)}>
                      <img src={deleteIcon} className="deleteIcon" alt="logo" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </header>
        <body>

        </body>
      </div>
    );
  }

  handleChange = (e, name) => { this.setState({ [e.target.name]: e.target.value }); };

  dataAddListner = (val) => {
    let prevLoop = this.state.loop;
    prevLoop.push(val);
    this.setState({ loop: prevLoop });
  };

  dataRemoveListner = (val) => {
    let prevLoop = this.state.loop;
    var i = prevLoop.findIndex(res=> res.key === val.key);
    (prevLoop).splice(i, 1);
    this.setState({ loop: prevLoop });
  };

  handlePaste = (e) => {
    var clipboardData, pastedData;
    e.stopPropagation();
    e.preventDefault();
    clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text');
    //this.dbWrite({title: "title", body: pastedData, type: 'type'});
    firebase.database().ref('users/' + this.state.user.uid).push({title: "title", body: pastedData, type: 'type'});
  };

  handleClick = (event) => {
    var copyText = document.getElementById(`toast${event.target.id}`);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
  };

  delete = (i) => {
    var survey=firebase.database().ref('users/' + this.state.user.uid);    //Eg path is company/employee                
    survey.child(i).remove();
  };

  submit = () =>{
    Firebase.signIn(this.state).then((res) => {
      // console.log('index', res);
    },(e) => {
      this.setState({ errorText : e });
    });
  };
}

export default App;
