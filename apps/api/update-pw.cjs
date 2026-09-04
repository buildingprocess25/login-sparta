const { Client } = require('pg');
const { hash } = require('@node-rs/argon2');

async function updatePassword() {
  const password = 'TzWdn_2106';
  
  try {
    // Generate new hash
    const newHash = await hash(password);
    console.log('Generated new hash:', newHash);

    const client = new Client({
      connectionString: 'postgresql://aku-sparta:0hhUTvTHKtgkN8TfLadC@103.127.99.241:5432/sparta?sslmode=disable',
    });

    await client.connect();
    console.log('Connected to sparta database successfully.');

    const res = await client.query(
      'UPDATE "User" SET "passwordHash" = $1, "failedLoginCount" = 0, "status" = \'ACTIVE\' WHERE email = $2 RETURNING email', 
      [newHash, 'wildan.fadillah@nusaputra.ac.id']
    );
    
    if (res.rows.length > 0) {
      console.log('Password successfully updated for:', res.rows[0].email);
    } else {
      console.log('User NOT found in DB.');
    }

    await client.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

updatePassword();
