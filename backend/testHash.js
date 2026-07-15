const bcrypt = require('bcrypt');
const hash = '$2b$10$nl4WZCNIqOOgxnmqOSogT.xE32IQ0I.sqzH8mRdRSp6cWi4nE/djq';
bcrypt.compare('adminpassword', hash).then(console.log);
bcrypt.compare('adminpassword\r', hash).then(console.log);
bcrypt.compare('password123', hash).then(console.log);
