const express = require('express');
const graphQLHttp = require('express-graphql');
const app = express();
const graphql = require('graphql');

const {buildSchema} = graphql;


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
            return events;
        },
        createEvent: (args) => {
            const event = {
                _id: Math.random().toString(),
                date: new Date(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: parseFloat(args.eventInput.price)
            }
            events.push(event);
            return event;
        }
    },
    graphiql: true

}));
const Port = process.env.port || 4000;
app.listen(Port, ()=> {
    console.log(`Running on ${Port}`);
})
