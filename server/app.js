const express = require('express');
const graphQLHttp = require('express-graphql');
const app = express();
const graphql = require('graphql');
const mongoose = require('mongoose');
const {buildSchema} = graphql;
const Event = require('./models/events');
const User = require('./models/user');

const url = 'mongodb://localhost:27017/graphql2';
mongoose.connect(url)
    .then(()=>console.log(`connected to ${url} `))
    .catch(error=>console.log(error));
const events = [];

app.use(express.json());

app.use('/graphql', graphQLHttp({
    schema:buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]!
        }

        input UserInput {
            email: String!,
            password: String!
        }
        type RootQuery {
            events:[Event!]!

        }
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User

        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: async() => {
            const data = await Event.find({}).populate('creator');
            return data;
        },
         createEvent: async(args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: parseFloat(args.eventInput.price),
                date: new Date(),
                creator: '5d1bb8dea80c7e7c76f7ff9d'
            });
            // event.save()
            const user = await User.findById('5d1bb8dea80c7e7c76f7ff9d');
            user.createdEvents.push(event);
            await user.save()
            return event.save().then(result =>result).catch(e=>error);
        },
        createUser: async(args) => {
            const { userInput:{ email, password } } =args
            const user = new User({
                email, password
            })
            await user.save();
            return user;
        }
    },
    graphiql: true

}));
const Port = process.env.port || 4000;
app.listen(Port, ()=> {
    console.log(`Running on ${Port}`);
})
