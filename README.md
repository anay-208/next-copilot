# Next-Copilot

> Note: I primarily built this extension to learn more about extending github copilot with extensions
> I personally don't use this extension much, and prefer to just go to the docs directly, as it gives incorrect info on some questions
> If you're planning to ues this extension, feel free to, but please note that it can provide in valid information

This extension will help you with Next.js app router. 

It has the latest docs to assist you.
 
Install the extension from [https://github.com/apps/next-copilot](https://github.com/apps/next-copilot)


**Note**: It might give inaccurate info. If it does, please create a issue to report it, and I'll see if I can just provide it more info to fix it.

If this project has been helpful to you, please consider giving it a star! 🌟 

You can also support my work further by [sponsoring me!](https://github.com/sponsors/anay-208/) Your contributions will help me take on more open-source projects!



# How It works

- I've manually downloaded the parts of docs, and included the most relevant ones in [docs folder](./docs)
- As soon as you send a message, it'll pass a message to a different instance of Copilot LLM, passing the messages to determine which docs are relevant to the problem i.e. that can solve the problem (Done in [messages.ts](./api/messages.ts)). 
- Once done, it passes all those docs to the chat instance, using the same Copilot LLM, but with Gpt-4o model. The main part about this is sending messages, guiding Copilot LLM how to reply & help the user.
- The response is streamed to the user


# Why this extension

I primarily built this extension to:
- Learn More about Github Copilot extensions, I had no other project ideas

