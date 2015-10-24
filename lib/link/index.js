'use strict';

var qs = require('querystring')
  , request = require('request-promise')
  , readline = require('readline');

var request_token_url = 'https://auth.opera.com/service/oauth/request_token'
  , authorization_url = 'https://auth.opera.com/service/oauth/authorize'
  , access_token_url  = 'https://auth.opera.com/service/oauth/access_token';

function wrapThat(that, func){
  return function(a){ return that[func](a); }
}

class OperaLink {
  constructor(ck, cs){
    this.key = ck;
    this.secret = cs;
  }

  requestToken(){
    let oauth = {
      consumer_key: this.key,
      consumer_secret: this.secret,
      callback: 'oob'
    }
    return request.post({url: request_token_url, oauth: oauth});
  }

  requestPin(){
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise(function(resolve, reject){
      rl.question('PIN: ', ans => {
        rl.close();
        resolve(ans);
      });
    });
  }

  accessToken(verifier, tempToken){
    let oauth = {
      consumer_key: this.key,
      consumer_secret: this.secret,
      token: tempToken.token,
      token_secret: tempToken.token_secret,
      verifier: verifier
    }
    return request.post({url: access_token_url, oauth: oauth});
  }

  authorize(body){
    let that = this;
    let data = qs.parse(body);
    console.log(authorization_url + '?' + qs.stringify({oauth_token: data.oauth_token}));
    return this.requestPin().then(ans => {
        return that.accessToken(ans, {token: data.oauth_token, token_secret: data.oauth_token_secret});
    });
  }

  signin(){
    let that = this;
    return this.requestToken()
    .then(wrapThat(this, 'authorize'))
    .then(body => {
      let data = qs.parse(body);
      that.token = data.oauth_token;
      that.token_secret = data.oauth_token_secret;
      return new Promise(r => r(that));
    });
  }

  get(url){
    let that = this;
    let oauth = {
      consumer_key: this.key,
      consumer_secret: this.secret,
      token: this.token,
      token_secret: this.token_secret,
    }
    return request.get({url: 'https://link.api.opera.com/rest/' + url, oauth: oauth});
  }

  bookmark(){
    console.log('bookmark');
    return this.get('bookmark/descendants');
  }
  note(){
    console.log('note');
    return this.get('note/descendants');
  }
  search_engine(){
    console.log('search_engine');
    return this.get('search_engine/children');
  }
  speeddial(){
    console.log('speeddial');
    return this.get('speeddial/children');
  }
  urlfilter(){
    console.log('urlfilter');
    return this.get('urlfilter/children');
  }
}

module.exports = OperaLink;
