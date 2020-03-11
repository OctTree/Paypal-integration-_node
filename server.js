var express = require('express'); 
var path = require('path'); 
var app = express(); 
var paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox',
  'client_id': 'YOUR_CLIENT_ID_HERE', // please provide your client id here 
  'client_secret': 'YOUR_CLIENT_SECRET_HERE' // provide your client secret here 
});

app.use('/', express.static(path.join(__dirname, 'public'))); 

app.get('/' , (req , res) => {
    res.redirect('/index.html'); 
})

app.get('/buy' , ( req , res ) => {
    var payment = {
            "intent": "authorize",
	"payer": {
		"payment_method": "paypal"
	},
	"redirect_urls": {
		"return_url": "http://127.0.0.1:3000/success",
		"cancel_url": "http://127.0.0.1:3000/err"
	},
	"transactions": [{
		"amount": {
			"total": 39.00,
			"currency": "USD"
		},
		"description": " a book on mean stack "
	}]
    }
	
    createPay( payment ) 
        .then( ( transaction ) => {
            var id = transaction.id; 
            var links = transaction.links;
            var counter = links.length; 
            while( counter -- ) {
                if ( links[counter].method == 'REDIRECT') {
                    return res.redirect( links[counter].href )
                }
            }
        })
        .catch( ( err ) => { 
            console.log( err ); 
            res.redirect('/err');
        });
}); 

app.get('/success' , (req ,res ) => {
    console.log(req.query); 
    res.redirect('/success.html'); 
})

app.get('/err' , (req , res) => {
    console.log(req.query); 
    res.redirect('/err.html'); 
})

app.listen( 3000 , () => {
    console.log(' app listening on 3000 '); 
})

var createPay = ( payment ) => {
    return new Promise( ( resolve , reject ) => {
        paypal.payment.create( payment , function( err , payment ) {
         if ( err ) {
             reject(err); 
         }
        else {
            resolve(payment); 
        }
        }); 
    });
}						
								