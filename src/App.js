import React from 'react';
import logo from './images/logo2.png';
import deleteIcon from './images/stop.png';
import off from './images/off.png';
import add from './images/add.png';
import code from './images/coding.png';
import mail from './images/mail.png';
import www from './images/www.png';
import note from './images/note.png';
import download from './images/download.png';
import up from './images/up.png';
import folder from './images/folder.png';

import './App.css';
import Firebase from './firebase';
import Helper from './helper';
import * as firebase from 'firebase';
var storageRef = firebase.storage().ref();

var db_ref = firebase.database().ref('/');

class App extends React.Component{

  constructor(props) {
    super(props);
    this.state = { email: '', password: '', errorText: '', user: '', loading: true, newTextModal: false, loop : [], uploadProgree: '' };
  }

  dropRef = React.createRef()
  handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); }
  handleDragIn = (e) => { e.preventDefault(); e.stopPropagation(); }
  handleDragOut = (e) => { e.preventDefault(); e.stopPropagation(); }

  handleDrop = (e) => {  
    e.preventDefault();
    e.stopPropagation();
    for(let i=0; i < e.dataTransfer.files.length; i++){
      this.handleUpload(e.dataTransfer.files[i]);
    }
  }

  onChangeFile(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log(e.target.files.length);
    //this.handleUpload(e.target.files[0]);
    for(let i=0; i < e.target.files.length; i++){
      this.handleUpload(e.target.files[i]);
    }
  }

  handleUpload = (rawfile) => {  
    var metadata = { contentType: rawfile.type};
    var originalFilename = rawfile.name;

    var file = rawfile;
    var fileType = rawfile.type.split("/")
    var uploadedFileref = 'userfile/devClipfile'+Math.floor(Math.random() * 1000000000)+'.'+fileType[1];
    var uploadTask = firebase.storage().ref(uploadedFileref).put(file, metadata);

    uploadTask.on('state_changed',(snapshot)=>{
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      this.setState({ uploadProgree: progress.toFixed(0) });
    },(error) => {
      // Handle unsuccessful uploads
    },() => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        firebase.database().ref('users/' + this.state.user.uid).push({title: "title", body: originalFilename, type: 'file', link:downloadURL, path: uploadedFileref});
      });
    });
  }

  componentDidMount(){
    let div = this.dropRef.current
    div.addEventListener('dragenter', this.handleDragIn)
    div.addEventListener('dragleave', this.handleDragOut)
    div.addEventListener('dragover', this.handleDrag)
    div.addEventListener('drop', this.handleDrop)

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
            link : data.val().link,
            path: data.val().path,
            key : data.key
          }
          this.dataAddListner(val);
        });

        commentsRef.on('child_removed', (data) => {
          let val = {
            type : data.val().type,
            title : data.val().title,
            body : data.val().body,
            link : data.val().link,
            path: data.val().path,
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
    const { loop, email, password, errorText, user, loading, newTextModal, uploadProgree } = this.state;
    return (
      <div className="App" id="App" ref={this.dropRef}>
      <meta name="viewport" content="width=device-width, user-scalable=no" />
        <header className="App-header">

          {user && (
            <div>
              <img src={logo} className="App-logo" alt="logo" />
              {uploadProgree != '' && uploadProgree < 100 && (
                <div>Uploading... ({uploadProgree}%)</div>
              )}
            </div>
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
                <div class="User-toast" onClick={() => Firebase.logout()}>
                  <div class="user-toads-body"> {user.email} </div>
                  <div class="logout-action">
                    <img src={off} className="deleteIcon" alt="logo" />
                  </div>
                </div>

                <div class="User-toast addTextToast" onClick={() => this.setState({ newTextModal: true })}>
                  <div class="user-toads-body"> Add </div>
                  <div class="logout-action">
                    <img src={add} className="deleteIcon" alt="logo" />
                  </div>
                </div>

                <div class="User-toast addTextToast" onClick={() => this.refs.fileUploader.click()}>
                  <div class="user-toads-body"> Upload </div>
                  <div class="logout-action">
                    <img src={up} className="deleteIcon" alt="logo" />
                    <input type="file" id="file" ref="fileUploader" multiple="multiple" onChange={this.onChangeFile.bind(this)} style={{display: "none"}}/>
                  </div>
                </div>

              </div>

              <div class="App-toast-container">
                {loop.map((res,key) =>(
                  <div class="App-toast" id={key} key={key}>
                    
                      {res.type == 'file' && (
                        <a href={res.link} download={res.body}>
                          <div class="toast-action toast-download">
                            <img src={download} className="downloadIcon" alt="logo" />
                          </div>
                        </a>
                      )}

                    <div class="toast-body" id={key} onClick={this.handleClick}>
                      <div class="Toast-input">
                        <textarea type="text" id={`toast${key}`} value={res.body} readonly/>
                      </div>
                      {res.body}
                      
                    </div>

                    <div class="toast-action-container">
                      {res.type == 'file' ? (
                            <div class="toast-action" onClick={() => this.action(res.body, 'file')}>
                              <img src={folder} className="wwwIcon" alt="logo" />
                            </div>
                        ):(
                          
                            <div style={{display: 'contents'}}>
                              {Helper.getType(res.body) == 'http' && (
                                <div class="toast-action" onClick={() => this.action(res.body, 'www')}>
                                  <img src={www} className="wwwIcon" alt="logo" />
                                </div>
                              )}
                              
                              {Helper.getType(res.body) == 'code' && (
                                <div class="toast-action" onClick={() => this.action(res.body, 'code')}>
                                  <img src={code} className="codeIcon" alt="logo" />
                                </div>
                              )}

                              {Helper.getType(res.body) == 'mail' && (
                                <div class="toast-action">
                                  <a href="mailto:someone@example.com?Subject=Hello%20again">
                                    <img src={mail} className="mailIcon" alt="logo" />
                                  </a>
                                </div>
                              )}

                              {Helper.getType(res.body) == 'note' && (
                                <div class="toast-action" onClick={() => this.action(res.body, 'note')}>
                                  <img src={note} className="mailIcon" alt="logo" />
                                </div>
                              )}
                          </div>
                        )
                      }
                      
                      <div class="toast-action" onClick={() => this.delete(res)}>
                        <img src={deleteIcon} className="deleteIcon" alt="logo" />
                      </div>
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

  action = (text, type) => {
    if(type == 'www'){
      window.open(text, "_blank");
    }
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
    if(i.type == 'file'){
      storageRef.child(i.path).delete().then((res) => {
        var survey=firebase.database().ref('users/' + this.state.user.uid);    //Eg path is company/employee                
        survey.child(i.key).remove();
      }).catch((error) => {
        // console.log(error);
      });
    }else{
      var survey=firebase.database().ref('users/' + this.state.user.uid);    //Eg path is company/employee                
      survey.child(i.key).remove();
    }
    
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
