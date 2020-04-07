import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyA2wYIb11nxuGmIZTn-j8zcevZHEEg_QPI",
  authDomain: "devclip.firebaseapp.com",
  databaseURL: "https://devclip.firebaseio.com",
  projectId: "devclip",
  storageBucket: "devclip.appspot.com",
  messagingSenderId: "96329604142",
  appId: "1:96329604142:web:ba2b99fe21acf4cebb53bf"
};

var app = firebase.initializeApp(firebaseConfig);

export default class Firebase {

  static signIn = async ({email, password}) => {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(email, password).then((resp) => {
        // console.log(resp);
      }).catch((error) => {
        // console.log(error);
        if(error.code == "auth/user-not-found"){
          firebase.auth().createUserWithEmailAndPassword(email, password).then((res) => {
            // console.log('createUserWithEmailAndPassword', res);
          }).catch(function(error) {
            reject(error.message)
            // console.log('createUserWithEmailAndPassword', error);
          });
        }else{
          reject(error.message)
        }
      });
    });
  };

  static logout = async () => {
    firebase.auth().signOut().then((res) => {
      // console.log(res);
    }).catch((error)=>{
      // console.log(error);
    });

  };

}