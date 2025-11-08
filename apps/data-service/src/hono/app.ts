import { Hono } from "hono";
import { adminRouter } from "./routes/admin";

export const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
  return c.text("Hello World");
});

// Mount admin routes
app.route("/admin", adminRouter);
