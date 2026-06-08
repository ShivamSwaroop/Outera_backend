// test-workflow.js

import dotenv from "dotenv";
dotenv.config();

import workflowService from "./services/workflow.js";

async function run() {
  const result =
    await workflowService.run(
      "stripe.com"
    );

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
}

run();