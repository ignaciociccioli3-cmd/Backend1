export const errorHandler = (error, req, res, _next) => {
  const status = error.status || 500;
  const message = error.message || "Internal server error";

  if (req.originalUrl.startsWith("/api")) {
    res.status(status).json({ error: message });
    return;
  }

  res.status(status).send(message);
};
