const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const body = request.body;

  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user: user._id,
  });

  if (!body.url && !body.title) {
    response.status(400).end();
  } else {
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog);
    await user.save();
    response.status(201).json(savedBlog);
  }
});

blogsRouter.delete("/:id", async (request, response) => {
  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  const userId = decodedToken.id;
  const blog = await Blog.findById(request.params.id);

  if (blog.user.toString() === userId.toString()) {
    await Blog.findByIdAndRemove(request.params.id);
  } else {
    return response.status(401).json({
      error: "a blog can be deleted only by the user who added the blog",
    });
  }

  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });
  response.status(204).end();
});

module.exports = blogsRouter;
