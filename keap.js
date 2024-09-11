const router = require('express').Router();
const CLIENTID = process.env.CLIENT_ID.toString();
const CLIENTSECRET = process.env.CLIENTSECRET.toString();
const CALLBACKURL = process.env.CALLBACKURL.toString();
const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient()

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
            const refresh_token = token.refresh_token;
            // svuoto db keap
            prisma.keap.deleteMany().then(res=> {
                console.log('keap svuotato')
                // metto i token nel db
                prisma.keap.create({
                    data: {
                        access_token,
                        refresh_token              
                    },
                  }).then(async res => {
                    await prisma.$disconnect()
                  }).catch(async err => {
                    console.error(err)
                    await prisma.$disconnect()
            
                })
            }).catch(async err => {
                console.error(err)
                await prisma.$disconnect()
            })
            
           
           console.log('access_token: '+access_token + ' refresh_token: '+refresh_token);
        })
        .catch(err => console.error(err))

    res.redirect('/')
})


router.get('/auth/infusionsoft/refresh', async (req, res)  => {
    const clientPlusSecret = CLIENTID.toString() + ':' + CLIENTSECRET.toString()
    
    let refresh_token, access_token;
    try {
        // Recupera i dati dalla collezione Keap
        const keapData = await prisma.keap.findFirst();
        
        if (!keapData) {
            throw new Error('Nessun dato Keap trovato nel database');
        }

        refresh_token = keapData.refresh_token;
        access_token = keapData.access_token;

        console.log('Token recuperati dal database:', { refresh_token, access_token });

        const bodyOption = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(clientPlusSecret).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token
            })
        }

        const response = await fetch(`https://api.infusionsoft.com/token`, bodyOption);
        const token = await response.json();

        // Aggiorna i token nel database
        await prisma.keap.update({
            where: { id: keapData.id },
            data: {
                access_token: token.access_token,
                refresh_token: token.refresh_token
            }
        });

        console.log('Token aggiornati:', { access_token: token.access_token, refresh_token: token.refresh_token });
        res.status(200).send('Refresh completato con successo');
    } catch (err) {
        console.error('Errore durante il refresh del token:', err);
        res.status(500).send(`Errore: ${err.message}`);
    } finally {
        await prisma.$disconnect();
    }
})


module.exports = router;
