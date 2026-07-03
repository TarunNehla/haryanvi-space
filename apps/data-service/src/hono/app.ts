import { Hono } from "hono";
import { cors } from "hono/cors";
import { adminRouter } from "./routes/admin";

export const app = new Hono<{ Bindings: Env }>();

// CORS middleware - allow requests from user-application
app.use(
  "/*",
  cors({
    origin: [
      "http://localhost:3000", // Local dev
      "https://tanstack-start-app.haryanvibe.workers.dev", // Production
    ],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.get("/", (c) => {
  return c.text("Hello World");
});

// Mount admin routes
app.route("/admin", adminRouter);
