import * as firebase from 'firebase';

const firebaseConfig = {
  
};

var app = firebase.initializeApp(firebaseConfig);

export default class Firebase {

  static signIn = async ({email, password}) => {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(email, password).then((resp) => {
        console.log(resp);
      }).catch((error) => {
        console.log(error);
        if(error.code == "auth/user-not-found"){
          firebase.auth().createUserWithEmailAndPassword(email, password).then((res) => {
            console.log('createUserWithEmailAndPassword', res);
          }).catch(function(error) {
            reject(error.message)
            console.log('createUserWithEmailAndPassword', error);
          });
        }else{
          reject(error.message)
        }
      });
    });
  };

  static logout = async () => {
    firebase.auth().signOut().then((res) => {
      console.log(res);
    }).catch((error)=>{
      console.log(error);
    });

  };

}