import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log(vapidKeys); 

// cd /Users/uugnaa/development/webDevelopment/jewelry/server
// node src/1.js