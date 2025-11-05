import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/consents", "routes/consents.tsx"),
  route("/org/:orgId", "routes/admin-dashboard.tsx"),
  route("/market", "routes/marketplace.tsx"),
  route("/transparency", "routes/transparency.tsx"),
  route("/cookies", "routes/web-privacy-companion.tsx"),
  route("/notifications", "routes/notifications.tsx"),
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
