const express = require('express');
const graphQLHttp = require('express-graphql');
const app = express();
const graphql = require('graphql');
const mongoose = require('mongoose');
const {buildSchema} = graphql;
const Event = require('./models/events');


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

        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find({});
        },
         createEvent: async(args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: parseFloat(args.eventInput.price),
                date: new Date()
            });
            // event.save()
            return event.save().then(result =>result).catch(e=>error);
        }
    },
    graphiql: true

}));
const Port = process.env.port || 4000;
app.listen(Port, ()=> {
    console.log(`Running on ${Port}`);
})
