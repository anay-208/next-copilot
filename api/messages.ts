import {
  InteropMessage,
  MessageRole,
  prompt,
} from "@copilot-extensions/preview-sdk";
import { getAllFilesRelativePaths } from "./utils.js";
import path from "node:path";
import { fileURLToPath } from 'url';
import { hints } from "./types.js";
import fs from "node:fs";


const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);


const docsPath = path.join(dirname, "../docs");
const list = getAllFilesRelativePaths(docsPath);

export default async function getPaths(
  messages: InteropMessage<MessageRole>[],
  apiKey: string,
  userMessage: InteropMessage<MessageRole>
): Promise<string[] | null> {
  const { message: paths } = await prompt({
    token: apiKey,
    messages: [
      ...messages,
      {
        role: "system",
        content: `This Query is relating To next.js App router. 
    You just have to provide the file paths, that the user would need to read, to complete their request.
    You can provide multiple file paths, seperated by a new line.
    If the user is just casual and not asking for any help, just return null.
    You don't need to solve the problem or do anything, just provide the file path among the list.`,
      },
      {
        role: "system",
        content: `Here are some additional keys & values to help you figure out file path based on keywords: ${JSON.stringify(
          hints
        )}`,
      },
      {
        role: "system",
        content: `The message is ${userMessage.content}`,
      },
      {
        role: "system",
        content: list.join("\n"),
      },
    ],
  });

  if(paths.content === "null"){
    return null;
  }

  return paths.content.split("\n")

}
