import { app } from "./server";

// Start the server
const PORT = process.env['PORT'] ?? 3000;
app.listen(PORT);
