const { hash } = require('@node-rs/argon2');
async function generate() {
  const h = await hash('TzWdn_2106');
  console.log(h);
}
generate();
