import { Server } from "./server";

const server = new Server();

server.listen(port => {
 console.log(`Server is listening on http://localhost:${port}`);
});

// export for testing
export default server;
