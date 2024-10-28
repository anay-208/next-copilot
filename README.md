# Next-Copilot

This extension will help you with Next.js app router. 

It has the latest docs to assist you.

# How It works

- I've manually downloaded the parts of docs, and included the most relevant ones in [docs folder](./docs)
- As soon as you send a message, it'll pass a message to a different instance of Copilot LLM, passing the messages to determine which docs are relevant to the problem i.e. that can solve the problem (Done in [messages.ts](./api/messages.ts)). 
- Once done, it passes all those docs to the chat instance, using the same Copilot LLM, but with Gpt-4o model. The main part about this is sending messages, guiding Copilot LLM how to reply & help the user.
- The response is streamed to the user