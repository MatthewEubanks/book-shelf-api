const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const { Book } = require('../models/book');
const { User } = require('../models/user');
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
      rating: '4',
      price: faker.finance.amount(),
      ownerId: '5bc02d28e8ccfb0004b0540d',
    });
  }
  // this will return a promise
  return Book.insertMany(seedData);
}

const email = 'demo@demo.com';
const password = 'password';

describe('book review API resource', () => {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function() {
    return seedBookData();
  });
  afterEach(function() {
    return tearDownDb();
  });
  after(function() {
    return closeServer();
  });

  describe('GET endpoint', () => {
    it('should return all existing book reviews', function(done) {
      chai
        .request(app)
        .get('/api/books?skip=0&limit=2&order=asc')
        .end(function(err, res) {
          console.log(res.body);
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          done();
        });
    });
    it('should return books with right fields', done => {
      let resBook;
      chai
        .request(app)
        .get('/api/books?skip=0&limit=2&order=asc')
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.lengthOf.at.least(1);

          res.body.forEach(function(book) {
            book.should.be.a('object');
            book.should.include.keys(
              'name',
              'author',
              'review',
              'rating',
              'pages',
              'price',
              'ownerId'
            );
          });

          done();
        });
    });
    it('should return a book with an ID', done => {
      var newBook = new Book({
        name: faker.lorem.words(),
        author: faker.name.findName(),
        review: faker.lorem.paragraph(),
        pages: faker.random.number(),
        rating: '4',
        price: faker.finance.amount(),
        ownerId: faker.random.number(),
      });
      newBook.save(function(err, data) {
        chai
          .request(app)
          .get('/api/books/?id=' + data.id)
          .end(function(err, res) {
            res.should.have.status(200);
            done();
          });
      });
    });
  });

  describe('POST endpoints', () => {
    it('should add a SINGLE book on /api/book', done => {
      chai
        .request(app)
        .post('/api/book')
        .send({
          name: faker.lorem.words(),
          author: faker.name.findName(),
          review: faker.lorem.paragraph(),
          pages: faker.random.number(),
          rating: 3,
          price: faker.finance.amount(),
          ownerId: faker.random.alphaNumeric(),
        })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          done();
        });
    });
    it('should return the user', done => {
      chai
        .request(app)
        .post('/api/register')
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(),
          name: faker.name.firstName(),
          lastname: faker.name.lastName(),
          role: 1,
          token: faker.random.uuid(),
        })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          res.body.user.should.be.a('object');
          res.body.user.should.have.property('email');
          res.body.user.should.have.property('password');
          res.body.user.should.have.property('name');
          res.body.user.should.have.property('lastname');
          res.body.user.should.have.property('role');
          res.body.user.should.have.property('token');
          done();
        });
    });
  });
  describe('PUT endpoint', () => {
    it('should should update fields sent over', done => {
      const singleBook = '5bc2354a23fdeb1f70b4a20c';
      chai
        .request(app)
        .get('/api/books')
        .end(function(err, res) {
          chai
            .request(app)
            .post('/api/book_update?id=' + res.body[0]._id)
            .send({
              review: 'Easy man',
            })
            .end(function(error, response) {
              response.should.have.status(200);
              done();
            });
        });
    });
  });
  describe('DELETE endpoint', () => {
    it('should delete a SINGLE book', done => {
      chai
        .request(app)
        .get('/api/books')
        .end(function(err, res) {
          chai
            .request(app)
            .delete('/api/delete_book?id=' + res.body[0]._id)
            .end(function(error, response) {
              response.should.have.status(200);
              done();
            });
        });
    });
  });
});
