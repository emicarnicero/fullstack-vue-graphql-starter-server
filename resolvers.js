const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createToken = (user, secret, expiresIn) => {
  const { username, email } = user;
  return jwt.sign({ username, email }, secret, { expiresIn });
};

module.exports = {
  Query: {
    getCurrentUser: async (_, args, { User, currentUser }) => {
      if (!currentUser) {
        return null;
      }

      const user = await User.findOne({
        username: currentUser.username
      }).populate("favorites");

      return user;
    },
    getUsers: async (_, args, { User }) => {
      const users = await User.find();
      return users;
    },
    getPosts: async (_, args, { Post }) => {
      const posts = await Post.find()
        .sort({ createdDate: "desc" })
        .populate("createdBy");
      return posts;
    }
  },
  Mutation: {
    addPost: async (
      _,
      { title, imageUrl, categories, description, creatorId },
      { User, Post }
    ) => {
      const user = await User.findOne({ _id: creatorId });

      if (!user) {
        throw new Error(`User doesn't exist`);
      }

      const newPost = await new Post({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId
      }).save();

      return newPost;
    },
    signupUser: async (_, { email, username, password }, { User }) => {
      const user = await User.findOne({ username });

      if (user) {
        throw new Error("User already exists");
      }

      const newUser = await new User({
        username,
        email,
        password
      }).save();

      return {
        user: newUser,
        token: createToken(newUser, process.env.SECRET, "1hr")
      };
    },
    signinUser: async (_, { username, password }, { User }) => {
      const user = await User.findOne({ username }).populate("favorites");

      if (!user) {
        throw new Error("User not found");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      return { user, token: createToken(user, process.env.SECRET, "1hr") };
    }
  }
};
