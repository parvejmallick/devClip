//import * as firebase from 'firebase';

export default class Helper {

  static getType = (str) => {

    var email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailrex = new RegExp(email);

    if(str.match(emailrex)){
      return 'mail';
    }else if(str.match(/http/)){
      return 'http';
    }else if(str.match(/<div/) || str.match(/<p/) || str.match(/<html/)){
      return 'code';
    }else{
      return 'note';
    }

    // switch (str){
    //   case str.match(httpregex):
    //     return 'http';
    //   case str.match(httpregex):
    //     return 'mail';

    //   default:
    //     return 'pin'
    // }

    // return str;
  };


}