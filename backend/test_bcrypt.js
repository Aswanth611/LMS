const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf8'));

for (let u of users) {
  if (u.email === 'admin@eduflick.ai') {
    console.log('Admin:', u.email);
    console.log('Match adminpassword:', bcrypt.compareSync('adminpassword', u.password));
  } else if (u.email === 'john@student.com') {
    console.log('Student:', u.email);
    console.log('Match studentpassword:', bcrypt.compareSync('studentpassword', u.password));
  }
}
