const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const port = process.env.PORT || 3000;

// Health check endpoint so Pxxl knows the app is alive
app.get('/', (req, res) => res.send('WhatsApp Bot is active and running!'));

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

        const sock = makeWASocket({
                auth: state,
                        printQRInTerminal: true,
                                logger: pino({ level: 'silent' })
                                    });

                                        sock.ev.on('connection.update', (update) => {
                                                const { connection, lastDisconnect } = update;

                                                                if (connection === 'close') {
                                                                            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
                                                                                        console.log('Connection closed. Reconnecting:', shouldReconnect);
                                                                                                    if (shouldReconnect) connectToWhatsApp();
                                                                                                            } else if (connection === 'open') {
                                                                                                                        console.log('✅ Bot connected to WhatsApp successfully!');
                                                                                                                                }
                                                                                                                                    });

                                                                                                                                        sock.ev.on('creds.update', saveCreds);

                                                                                                                                            sock.ev.on('messages.upsert', async m => {
                                                                                                                                                    const msg = m.messages[0];
                                                                                                                                                            if (!msg.key.fromMe && m.type === 'notify') {
                                                                                                                                                                        const remoteJid = msg.key.remoteJid;
                                                                                                                                                                                    console.log(`Message received from: ${remoteJid}`);
                                                                                                                                                                                                await sock.sendMessage(remoteJid, { text: 'Hello from the cloud! ☁️🤖' });
                                                                                                                                                                                                        }
                                                                                                                                                                                                            });
                                                                                                                                                                                                            }

                                                                                                                                                                                                            // Start the web server and the bot
                                                                                                                                                                                                            app.listen(port, () => {
                                                                                                                                                                                                                console.log(`Web server listening on port ${port}`);
                                                                                                                                                                                                                    connectToWhatsApp();
                                                                                                                                                                                                                    });
                                                                                                                                                                                                                    
