require('dotenv/config');

// Require Express
const express = require('express');
const app = express();

// Require Request NPM Package for /POST to /oauth endpoint
const request = require('request');

// Body parser for JSON response
const bodyParser = require('body-parser');


app.get('/', (req, res) => {

    // #1: 
    // ---> Determine if `code` param is included in redirect URL
    // ---> If included, proceed to #3. If not included, proceed to #2

    if (req.query.code) {

        // #3: 
        // ---> Request access_token

        var url = 'https://api.miro.com/v1/oauth/token?grant_type=authorization_code&client_id=3458764520765619408&client_secret=loGHWJ8v2JymV4CcjhY7K98ksIP9iecU&code=' + req.query.code + '&redirect_uri=' + process.env.redirectURL
    
        request.post(url, (error, response, body) => {
            
            body = JSON.parse(body);
        
            // ---> Console log access_token and refresh_token for reference
            console.log(`access_token: ${body.access_token}`);
            console.log(`refresh_token: ${body.refresh_token}`);

            if (body.access_token) {

                // #4:
                // Send request to any Miro API endpoint that contains the same permissions as your OAuth 2.0 app in https://miro.com/app/settings/user-profile/apps

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

    // Step 2: 
    // If no authorization code is available, redirect to Miro OAuth to authorize
    res.redirect('https://miro.com/oauth/authorize?response_type=code&client_id=' + process.env.clientID + '&redirect_uri=' + process.env.redirectURL)
})

app.listen(4000, () => console.log(`Hello World app listening at PORT: 4000`))