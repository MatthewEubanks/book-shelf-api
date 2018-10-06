const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const { Book } = require('../models/book');
const { closeServer, runServer, app } = require('../server');
const { TEST_DATABASE_URL } = require('../config/config');

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection
      .dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedBookData() {
  console.info('seeding book data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      name: faker.lorem.words(),
      author: faker.name.findName(),
      review: faker.lorem.paragraph(),
      pages: faker.random.number(),
      rating: faker.random.number(),
      price: faker.finance.amount(),
      ownerId: faker.random.alphaNumeric(),
    });
  }
  // this will return a promise
  return Book.insertMany(seedData);
}

// describe('book review API resource', () => {
//   before(function() {
//     return runServer(TEST_DATABASE_URL);
//   });
//   beforeEach(function() {
//     return seedBookData();
//   });
//   afterEach(function() {
//     return tearDownDb();
//   });
//   after(function() {
//     return closeServer();
//   });

describe('GET endpoint', () => {
  it('should return all existing book reviews', function(done) {
    let res;
    chai
      .request(app)
      .get('/api/books?skip=3&limit=2&order=asc')
      .end(function(err, res) {
        console.log(res.body);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        done();
      });
  });
});
// });
