import express from "express";
import { Hono } from "hono";
import { Readable } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import {
  createAckEvent,
  createTextEvent,
  createDoneEvent,
  verifyAndParseRequest,
  prompt,
  InteropMessage,
  MessageRole,
} from "@copilot-extensions/preview-sdk";
import bodyParser from "body-parser";
import getPaths from "./messages.js";
import { fileURLToPath } from 'url';


const app = express();

const log = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};


// Get dirname as __dirname doesn't work in this es version
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

app.use(bodyParser.json());

app.get("/", async (req, res) => {
  res.redirect("https://github.com/anay-208/next-copilot");
});

interface Headers extends Record<string, string> {
  "x-github-token": string;
  "github-public-key-signature": string;
  "github-public-key-identifier": string;
}

app.post("/", async (req, res) => {
  try {
  // Verify Request
  let verifyAndParseRequestResult: Awaited<
    ReturnType<typeof verifyAndParseRequest>
  >;
  const headers: Headers = req.headers as Headers;
  const apiKey = headers["x-github-token"];
  try {
    const signature = headers["github-public-key-signature"];
    const keyID = headers["github-public-key-identifier"];
    verifyAndParseRequestResult = await verifyAndParseRequest(
      JSON.stringify(req.body),
      signature,
      keyID
    );
  } catch (err) {
    console.error(err);
    res.statusCode = 401;
    res.end("Unauthorized");
    return;
  }

  const { payload } = verifyAndParseRequestResult;

  log("Signature verified");
  // Create a acknowledge event
  res.write(createAckEvent());
  const messages: InteropMessage<MessageRole>[] = payload.messages;
  // Get File Paths
  const userMessage = messages.pop();
  if (!userMessage) {
    res.write(createTextEvent("Failed to get user message"));
    res.end(createDoneEvent());
    return;
  }

  // Get Path of Documentations to give to user
  const paths = await getPaths(messages, apiKey, userMessage);
  messages.push({
    role: "system",
    content: `You are a assistant, who helps people with nextjs.
     You have to completely forget about Page Router i.e. pages directory.
     You're specifically here to help with app directory.
     There is a new directory in nextjs, App Directory, which is much better.
     You have to help users with the app directory.
     You'll be given the documentation, when necessary.
     `,
  });
  messages.push(userMessage);

  // Give Documentation to LLM
  if (paths) {
    messages.push({
      role: "system",
      content: `Here are the documentation that you need to refer to help the user.`,
    });
    for (const docPath of paths) {
      if (fs.existsSync(path.join(dirname, "../docs", docPath))) {
        log(`providing ${docPath}`);
        const file = fs.readFileSync(path.join(dirname, "../docs", docPath));
        messages.push({
          role: "system",
          content: file.toString(),
        });
      }
    }
    messages.push({
      role: "system",
      content: `Now, You need to help the user with this. 
      Don't send any documentation links, and it should be related to App dir only! 
      Try to only help the user with the topic, and don't give too much additional information unless asked.
      Note: Next.js is currently on v15`,
    });
  }
  // Use Copilot's LLM to generate a response to the user's messages, with
  // our extra system messages attached.

  const { stream } = await prompt.stream({
    model: "gpt-4o",
    messages: messages,
    token: apiKey,
  });

  const reader = stream.getReader();
  const nodeStream = new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(Buffer.from(value));
      }
    },
  });

  nodeStream.pipe(res);
} catch (err){
  console.error(err);
  res.write(createTextEvent("An Error occured"))
  res.status(500).end(createDoneEvent());
}
});

const port = Number(process.env.PORT || "8080");
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// for vercel
export default app;