const { assert } = require('chai');

const { findUserByEmail, urlsForUser }  = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID, "user ID is found");
  });

	it('should return a undefined with invalid email', function() {
    const user = findUserByEmail('asdfas@example.com', testUsers);
		assert.isUndefined(user);
  });

}); 
