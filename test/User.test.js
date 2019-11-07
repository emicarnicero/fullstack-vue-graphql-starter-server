const assert = require("chai").assert;
const url = `http://localhost:4000`;
const request = require("supertest")(url);

describe("GraphQL", () => {
  it("Returns all users", done => {
    request
      .post("/graphql")
      .send({
        query: `query {
        getUsers {
          _id
          username
          email
          password
          avatar
          joinDate
        }
      }`
      })
      .expect(200)
      .end((err, res) => {
        // res will contain array of all users
        if (err) return done(err);
        // assume there are a 14 users in the database
        assert.equal(res.body.data.getUsers.length, 14);
        done();
      });
  });
});
