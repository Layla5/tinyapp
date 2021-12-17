//find user by email function

const findUserByEmail = (email, users) => {
  for(const id in users) {
    const user = users[id];
    if(user.email === email) {
      return user;
    }
  }
  return undefined;
}


//url for users function
const urlsForUser = (userID, urlDatabase) => {
  const userUrls = {};
  for(const id in urlDatabase) {
    const url = urlDatabase[id];
    if(url.userID === userID) {
      userUrls[id] = url.longURL;
    }
  }
  return userUrls;
}

module.exports = { findUserByEmail, urlsForUser };
