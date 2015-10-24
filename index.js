'use strict';

var fs = require('fs')
  , OperaLink = require('./lib/link');

const
  consumer_key = '2xqh6s7mnUP9pSqyiK9XYCWrFUUrWaau',
  consumer_secret = 'x0uEZaqe0FbRxwIB620hgkiTNw2dMV6X'

var
  backup = {};

var link = new OperaLink(consumer_key, consumer_secret);
link.signin()
.then(_ => { return link.bookmark(); })
.then(a => {
  backup.bookmark = JSON.parse(a);
  return link.note();
}).then(a => {
  backup.note = JSON.parse(a);
  return link.search_engine();
}).then(a => {
  backup.search_engine = JSON.parse(a);
  return link.speeddial();
}).then(a => {
  backup.speeddial = JSON.parse(a);
  return link.urlfilter();
}).then(a => {
  backup.urlfilter = JSON.parse(a);
  fs.writeFileSync('backup.json', JSON.stringify(backup));
  console.log('all done!');
});
