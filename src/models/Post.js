const mongoose = require('mongoose')

const PostSchema = mongoose.Schema(
	{
		title: String,
		text: String,
		backgroundURL: String
	},
	{
		timestaps: true
	}

);

const Post = mongoose.model('Post', PostSchema);

module.exports = Post