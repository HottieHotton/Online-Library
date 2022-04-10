//Used for logging in and the tokens
const { authenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth.js');

//For the website
const { User, Book } = require('../models');

//Resolver
let resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({ _id: context.user._id})
                .select('-__v -password')

                return userData;
            }

            throw new authenticationError("You're not logged in!")
        }
    },

    Mutation: {
        //Creates a user
        addUser: async (parent, { username, email, password}) => {
            const user = await User.create({ username, email, password});
            const pass = signToken(user);

            return { pass, user};
        },
        //Checks to see if the entered information matches
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if(!user) {
                throw new AuthenticationError('Wrong username!');
            }

            const correctPass = await user.isCorrectPassword(password);
            if(!correctPass){
                throw new AuthenticationError('Wrong password!');
            }

            const pass = signToken(user);
            return { pass, user};
        },
        //Save book to user
        saveBook: async (parent, { bookData }, context) =>{
            if(context.user){
                const addBook = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true }
                );
                return addBook;
            }
            throw new AuthenticationError('Log in to save this book!');
        },
        //Remove book
        removeBook: async (parent, { bookId }, context) => {
            if(context.user) {
                const deleteBook = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                return removeBook;
            }
            throw new AuthenticationError('Log in to remove this book!')
        }
    }
};

module.exports = resolvers;