/* Creates backend/.env and frontend/.env.local from the examples if they don't exist,
 * generating a random admin token so the dashboard is never left on a default secret. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
const pairs = [
  ['backend/.env.example', 'backend/.env'],
  ['frontend/.env.example', 'frontend/.env.local'],
];

for (const [example, target] of pairs) {
  const to = path.join(root, target);
  if (fs.existsSync(to)) { console.log(`• ${target} already exists — left unchanged`); continue; }
  let text = fs.readFileSync(path.join(root, example), 'utf8');
  if (target === 'backend/.env') {
    const token = crypto.randomBytes(24).toString('base64url');
    text = text
      .replace('ADMIN_TOKEN=change-me-learning-loft', `ADMIN_TOKEN=${token}`)
      .replace('IP_HASH_SALT=change-me-too', `IP_HASH_SALT=${crypto.randomBytes(16).toString('hex')}`);
    console.log(`• Created ${target}\n  Admin dashboard token: ${token}\n  (sign in at http://localhost:3000/admin)`);
  } else {
    console.log(`• Created ${target}`);
  }
  fs.writeFileSync(to, text);
}
