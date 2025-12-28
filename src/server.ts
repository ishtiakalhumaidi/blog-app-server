import app from "./app";
import { prisma } from "./lib/prisma";

const port = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log("connected to the database successfully.");

    app.listen(port, () => {
      console.log("server is running on port", port);
    });
  } catch (error) {
    console.error("an error occurred", error);
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()