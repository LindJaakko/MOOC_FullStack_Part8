const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let books = await Book.find({}).populate('author')
      if (!args.author && !args.genre) {
        return books
      }
      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author })
        return books
          .filter((book) => {
            return book.author.equals(author._id)
          })
          .filter((b) => b.genres.includes(args.genre))
      }
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        return books.filter((book) => {
          return book.author.equals(author._id)
        })
      }
      if (args.genre) {
        return books.filter((b) => b.genres.includes(args.genre))
      }
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    },
    allGenres: async () => {
      const allBooks = await Book.find({})
      const genres = new Set(
        allBooks.map((b) => b.genres).reduce((a, b) => a.concat(b))
      )
      return [...genres]
    },
  },

  Author: {
    bookCount: async (root) => {
      //return root.books.length
      return await Book.find({ author: root.id }).countDocuments()
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author })

      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      if (!author) {
        author = new Author({ name: args.author, bookCount: 1 })
      } else {
        author.bookCount += 1
      }

      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            error,
          },
        })
      }

      const book = new Book({ ...args, author: author._id })

      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            error,
          },
        })
      }
      book.author = author

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },
    editAuthor: async (root, args, context) => {
      let author = await Author.findOne({ name: args.name })
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      if (!author) {
        return null
      }
      author.born = args.setBornTo

      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            error,
          },
        })
      }
      return author
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })

      return user.save().catch((error) => {
        throw new GraphQLError(error.message, {
          extensions: {
            error,
          },
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}

module.exports = resolvers
