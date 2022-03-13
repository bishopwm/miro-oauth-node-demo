// This sample app is intended to demonstrate the OAuth 2.0 flow that is required to call Miro's V2 APIs. 
// This Node.js demo can be used as a structural basis for any other preferred language/framework.
// For the full guide on our OAuth 2.0 flow, please see the documentation here:
// https://beta.developers.miro.com/docs/getting-started-with-oauth 

// #0: Require dependencies: 
// ---> 'dotenv', 'Express', 'Request', 'Body-Parser'

// Require sensitive environment variables (Client ID, Client Secret, Miro Board ID)
require('dotenv/config');

// Require Express for local server
const express = require('express');
const app = express();

// Require 'Request' NPM Package for handling HTTP requests to Miro /oauth and API endpoint
const request = require('request');

// Require 'Body parser' NPM Package parsing the JSON response from API
const bodyParser = require('body-parser');

// Make request using Express
app.get('/', (req, res) => {

    // #1: 
    // ---> If `code` param is already present in redirect URL, proceed to #3 (Requesting access_token/refresh_token pair, using `code`)
    // ---> If a `code` has not already been retrieved, proceed to #2 (Redirect to Miro authorization URL)

    if (req.query.code) {

        // #3: 
        // ---> Request access_token and refresh_token pair by making a request to Miro /oauth endpoint. 
        // ---> Parameters include `grant_type`, `client_id`, `client_secret`, `code`, and `redirect_uri`.
        // ---> See full details in Miro documentation here: https://beta.developers.miro.com/docs/getting-started-with-oauth#step-3

        var url = 'https://api.miro.com/v1/oauth/token?grant_type=authorization_code&client_id=3458764520765619408&client_secret=loGHWJ8v2JymV4CcjhY7K98ksIP9iecU&code=' + req.query.code + '&redirect_uri=' + process.env.redirectURL
    
        request.post(url, (error, response, body) => {
            
            body = JSON.parse(body);
        
            // ---> For reference: console log access_token and refresh_token on express server
            console.log(`access_token: ${body.access_token}`);
            console.log(`refresh_token: ${body.refresh_token}`);

            if (body.access_token) {

                // #4:
                // Send an API request to any Miro endpoint that contains the same permissions as your OAuth 2.0 app in https://miro.com/app/settings/user-profile/apps

                request.get('https://api.miro.com/v2/boards/uXjVOHbG8r4=', (error, response, body) => {
                    if (error) {
                        console.log('Error: ', error)
                    } else {
                        body = JSON.parse(body);
                        // Display response in console
                        console.log('API call ', body);
                        // Display response in browser
                        var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
                        res.send(`
                            <div class="container">
                                <div class="info">
                                    <div>
                                        <h1>Hello, World!</h1>
                                    </div>
                                </div>
                                <div class="response">
                                    <h2>API Response:</h2>
                                    ${JSONResponse}
                                </div>
                            </div>
                        `);
                    }
                }).auth(null, null, true, body.access_token);

            } else {
                console.log("Error, need to do some digging.")
            }

        }).auth(process.env.clientID, process.env.clientSecret);

        return;

    }

    // #2: 
    // If no authorization code is present, redirect to Miro OAuth to authorize retrieve new `code`.
    res.redirect('https://miro.com/oauth/authorize?response_type=code&client_id=' + process.env.clientID + '&redirect_uri=' + process.env.redirectURL)
})

// Run express server on Localhost 3000
app.listen(3000, () => console.log(`Listenting on Localhost 3000`))