const router = require('express').Router();
const CLIENTID = process.env.CLIENT_ID.toString();
const CLIENTSECRET = process.env.CLIENTSECRET.toString();
const CALLBACKURL = process.env.CALLBACKURL.toString();

const headerCreateOption = (body) => {
    return {
        method: 'POST', headers: {
            contentType: 'application/json',
            'Api-Token': apiKey.toString()
        },
        body:  JSON.stringify(body)
    }

}
router.get('/auth/infusionsoft', async (req, res ) => {
    res.redirect(`https://accounts.infusionsoft.com/app/oauth/authorize?client_id=${CLIENTID}&redirect_uri=${CALLBACKURL}&response_type=code&scope=full`)
      })


router.get('/auth/infusionsoft/callback', async (req, res ) => {
    const code = req.query.code
    const bodyOption = {
        method: 'POST', headers: {
            contentType: 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: CLIENTID,
            client_secret: CLIENTSECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: CALLBACKURL
        })
    }
    await fetch(`https://api.infusionsoft.com/token`,bodyOption)
        .then(token => token.json())
        .then(token => {
            const access_token = token.access_token;
            const refresh_token = token.access_token;
            // put the value in db or cache
           console.log('access_token: '+access_token + ' refresh_token: '+refresh_token);
        })
        .catch(err => console.error(err))

    res.redirect('/')
})


router.get('/auth/infusionsoft/refresh', async (req, res)  => {
    const clientPlusSecret = CLIENTID.toString() + ':' + CLIENTSECRET.toString()
    let refresh_token = req.query.refresh_token // prelevare da cache o db;
    const bodyOption = {
        method: 'POST', headers: {
            contentType: 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(clientPlusSecret).toString('base64')}`,
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token
        })
    }

    await fetch(`https://api.infusionsoft.com/token`,bodyOption)
        .then(token => token.json())
        .then(token => {
            const access_token = token.access_token;
            const refresh_token = token.access_token;
            // put the value to the db or cache
            console.log('access_token: '+access_token + ' refresh_token: '+refresh_token);
            res.status(200).send('refresh');
        })
        .catch(err => {
            console.error(err)
            res.status(500).send('error:' + err);
        })
})


module.exports = router;
