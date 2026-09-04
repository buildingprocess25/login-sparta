const { verify } = require('@node-rs/argon2');

async function testPassword() {
  const hash = '$argon2id$v=19$m=19456,t=2,p=1$gbCEva1mq828EV+6arqKUQ$GO5RTe1m3l2cCB0g/KNdkLcESwiacJjs0zwAmdcGILg';
  const password = 'TzWdn_2106';

  try {
    const isValid = await verify(hash, password);
    console.log('Password valid:', isValid);
  } catch (err) {
    console.error('Error:', err);
  }
}

testPassword();
