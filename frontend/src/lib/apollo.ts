import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";


export const client = new ApolloClient({
  // Asegúrate de que este puerto sea el de Django (8000)
  link: new HttpLink({
    uri: "http://127.0.0.1:8000/graphql/",
  }),
  cache: new InMemoryCache(),
});