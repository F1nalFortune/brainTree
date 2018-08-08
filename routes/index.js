'use strict';
var express = require('express');
var router = express.Router();
var braintree = require('braintree');
var gateway = require('../lib/gateway');
var passport = require('passport');
var User = require('../models/user');




var TRANSACTION_SUCCESS_STATUSES = [
  braintree.Transaction.Status.Authorizing,
  braintree.Transaction.Status.Authorized,
  braintree.Transaction.Status.Settled,
  braintree.Transaction.Status.Settling,
  braintree.Transaction.Status.SettlementConfirmed,
  braintree.Transaction.Status.SettlementPending,
  braintree.Transaction.Status.SubmittedForSettlement
];

function formatErrors(errors) {
  var formattedErrors = '';

  for (var i in errors) { // eslint-disable-line no-inner-declarations, vars-on-top
    if (errors.hasOwnProperty(i)) {
      formattedErrors += 'Error: ' + errors[i].code + ': ' + errors[i].message + '\n';
    }
  }
  return formattedErrors;
}

function createResultObject(transaction) {
  var result;
  var status = transaction.status;

  if (TRANSACTION_SUCCESS_STATUSES.indexOf(status) !== -1) {
    result = {
      header: 'Sweet Success!',
      icon: 'success',
      message: 'Your test transaction has been successfully processed. See the Braintree API response and try again.'
    };
  } else {
    result = {
      header: 'Transaction Failed',
      icon: 'fail',
      message: 'Your test transaction has a status of ' + status + '. See the Braintree API response and try again.'
    };
  }

  return result;
}

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index.ejs', { title: 'Express' });
// });




router.get('/checkouts/new', function (req, res) {
  gateway.clientToken.generate({}, function (err, response) {
    res.render('checkouts/new.ejs', {clientToken: response.clientToken, messages: req.flash('error'), user: req.user });
  });
});

router.get('/checkouts/:id', function (req, res) {
  var result;
  var transactionId = req.params.id;

  gateway.transaction.find(transactionId, function (err, transaction) {
    result = createResultObject(transaction);
    res.render('checkouts/show', {transaction: transaction, result: result});
  });
});

router.post('/checkouts', function (req, res) {
  var transactionErrors;
  var amount = req.body.amount; // In production you should not take amounts directly from clients
  var nonce = req.body.payment_method_nonce;

  gateway.transaction.sale({
    amount: amount,
    paymentMethodNonce: nonce,
    options: {
      submitForSettlement: true
    }
  }, function (err, result) {
    if (result.success || result.transaction) {
      res.redirect('checkouts/' + result.transaction.id);
    } else {
      transactionErrors = result.errors.deepErrors();
      req.flash('error', {msg: formatErrors(transactionErrors)});
      res.redirect('checkouts/new');
    }
  });
});

//tokens
router.get("/client_token", function (req, res) {
  gateway.clientToken.generate({}, function (err, response) {
    res.send(response.clientToken);
  });
});




function isAuthenticated(req, res, next) {
  if (req.user)
    return next();
  else
    res.redirect('/');
}

router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', {user: req.user});
});
/* GET home page. */
router.get('/', (req, res, next) =>  {
  res.render('index.ejs', { title: 'Express', user: req.user });
});

/* Register */

router.get('/register', (req, res) => {
  if (req.user)
    return res.back;
  res.render('register', {user: req.user });
});

/* About */

router.get('/about', (req, res) => {
  res.render('about.ejs', {user: req.user });
});


/* Products */

router.get('/products', (req, res) => {
  res.render('products.ejs', {user: req.user });
});


/* Contact */

router.get('/contact/', (req, res) => {
  res.render('contact.ejs', {user: req.user });
});

router.get('/cbd/', (req, res) => {
  res.render('cbd.ejs', {user: req.user });
});
/* Create User */

router.post('/register', (req, res) => {
  User.register( new User ({ username: req.body.username}), req.body.password, (err, user) => {
    if (err)
      return res.render('register', { user: user });
    passport.authenticate('local')(req, res, () => {
      console.log(res);
      res.redirect('/');
    });
  });
});



//Don't need after installed navbar
router.get('/login', (req, res) => {
 res.render('login.ejs', {user: req.user });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


module.exports = router;
