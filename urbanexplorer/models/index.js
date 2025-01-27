import mongoose from 'mongoose';
import User from './User';
import Post from './Post';
import Blog from './Blog';
import City from './City';
import Comment from './Comment';
import Vote from './Vote';

const models = { User, Post, Blog, City, Comment, Vote };

export default models;